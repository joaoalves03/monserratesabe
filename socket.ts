import {Server} from 'socket.io'
import { Server as HttpServer } from "node:http"
import {AppDataSource} from "./data-source.js"
import {Round} from "./entities/Round.js"
import type {GamePhase} from "./entities/Round.js"
import {Question} from "./entities/Question.js"
import {RoundQuestion} from "./entities/RoundQuestion.js"
import {RoundTeam} from "./entities/RoundTeam.js"
import {Answer} from "./entities/Answer.js"
import {RoundCategory} from "./entities/RoundCategory.js"

let io: Server

const roundRepository = AppDataSource.getRepository(Round)
const roundTeamRepository = AppDataSource.getRepository(RoundTeam)
const roundCategoryRepository = AppDataSource.getRepository(RoundCategory)
const roundQuestionRepository = AppDataSource.getRepository(RoundQuestion)
const questionRepository = AppDataSource.getRepository(Question)
const answerRepository = AppDataSource.getRepository(Answer)

async function updateTeamPoints(increase: boolean, val: Object, socket: any) {
    const teams = await roundTeamRepository.find({
        where: {
            round_id: socket.data.gameId
        }
    })

    console.log(teams)

    for(let index of Object.keys(val)) {
        const team = teams.find((x) => x.team_id == Number(index))

        await roundTeamRepository.update(
            {
                team_id: Number(index),
                round_id: Number(socket.data.gameId)
            },
            {
                score: Math.max(0, increase ? team.score + val[index] : val[index])
            }
        )
    }

    io.to(`game-${socket.data.gameId}`)
        .emit("updateState",
            await roundRepository
                .createQueryBuilder("round")
                .leftJoinAndSelect("round.round_questions", "round_questions")
                .leftJoinAndSelect("round.round_teams", "round_teams")
                .leftJoinAndSelect("round_teams.team", "team")
                .leftJoinAndSelect("team.members", "members")
                .leftJoinAndSelect("round.round_categories", "round_categories")
                .where("round.id = :gameId", { gameId: socket.data.gameId })
                .orderBy("round_teams.order", "ASC")
                .getOne())
}

export const initIO = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*'
        }
    })

    io.engine.use((req: any, res: any, next: any) => {
        next();
    })

    io.on('connection', (socket) => {
        socket.on('joinGame', async (gameId) => {
            try {
                socket.join(`game-${gameId}`)
                socket.data.gameId = gameId

                const round = await roundRepository
                    .createQueryBuilder("round")
                    .leftJoinAndSelect("round.round_questions", "round_questions")
                    .leftJoinAndSelect("round.round_teams", "round_teams")
                    .leftJoinAndSelect("round_teams.team", "team")
                    .leftJoinAndSelect("team.members", "members")
                    .leftJoinAndSelect("round.round_categories", "round_categories")
                    .where("round.id = :gameId", { gameId })
                    .orderBy("round_teams.order", "ASC")
                    .getOne()

                socket.emit("updateState", round)
            } catch (error) {
                socket.emit("error", error)
            }
        })

        socket.on('updatePhase', async (key: string) => {
            try {
                await roundRepository.update({id: socket.data.gameId}, {
                    status: "SELECT_TEAM",
                    phase: key as GamePhase,
                })

                io.to(`game-${socket.data.gameId}`).emit("updateState", {
                    status: "SELECT_TEAM",
                    phase: key
                })
            } catch (error) {
                socket.emit("error", error)
            }
        })

        socket.on('updateRound', async(data: Partial<Round>, incrementGame: boolean | undefined) => {
            try {
                await roundRepository.update({id: socket.data.gameId}, data)

                if(incrementGame) {
                    await roundRepository.update({id: socket.data.gameId}, {
                        round_game: () => 'round_game + 1'
                    })
                }

                const round = await roundRepository.findOne({
                    where: {id: socket.data.gameId}
                })

                io.to(`game-${socket.data.gameId}`).emit("updateState", round)
            } catch (error) {
                socket.emit("error", error)
            }
        })

        socket.on('launchQuestion', async() => {
            try {
                const round = await roundRepository.findOne({where: {id: socket.data.gameId}})
                const question = await questionRepository
                    .createQueryBuilder('question')
                    .leftJoin('question.category', 'category')
                    .where('category.id = :categoryId', { categoryId: round.selected_category })
                    .andWhere(subQuery => {
                        const subQueryBuilder = subQuery
                            .subQuery()
                            .select('rq.question_id')
                            .from(RoundQuestion, 'rq')
                            .where('rq.round_id = :roundId', { roundId: round.id })
                            .getQuery()
                        return `question.id NOT IN ${subQueryBuilder}`
                    })
                    .orderBy('RANDOM()')
                    .limit(1)
                    .getOne()

                await roundRepository.update({id: socket.data.gameId}, {
                    status: "SELECT_ANSWER",
                    selected_question: question.id,
                    selected_answer: null,
                    current_question_number: () => `current_question_number + 1`,
                    answer_shuffle_seed: Math.random()
                })

                await roundCategoryRepository.insert({
                    round_id: round.id,
                    category_id: round.selected_category,
                    team_id: round.selected_team,
                    round_game: round.round_game
                })

                const updatedRound = await roundRepository.findOne({
                    where: { id: socket.data.gameId }
                })

                io.to(`game-${socket.data.gameId}`).emit("updateState", {
                    status: "SELECT_ANSWER",
                    selected_question: question.id,
                    selected_answer: null,
                    current_question_number: updatedRound.current_question_number
                })
            } catch (error) {
                socket.emit("error", error)
            }
        })

        socket.on('launchBuzzerQuestion', async() => {
            try {
                const round = await roundRepository.findOne({where: {id: socket.data.gameId}})
                const question = await questionRepository
                    .createQueryBuilder('question')
                    .leftJoinAndSelect('question.category', 'category')
                    .andWhere(subQuery => {
                        const subQueryBuilder = subQuery
                            .subQuery()
                            .select('rq.question_id')
                            .from(RoundQuestion, 'rq')
                            .where('rq.round_id = :roundId', { roundId: round.id })
                            .getQuery()
                        return `question.id NOT IN ${subQueryBuilder}`
                    })
                    .orderBy('RANDOM()')
                    .limit(1)
                    .getOne()

                if(!question) {
                    socket.emit("outOfQuestions")
                    return
                }

                await roundRepository.update({id: socket.data.gameId}, {
                    status: "SELECT_ANSWER",
                    phase: "BUZZER",
                    selected_team: null,
                    selected_answer: null,
                    selected_category: question.category.id,
                    selected_question: question.id,
                    current_question_number: () => `current_question_number + 1`,
                    answer_shuffle_seed: Math.random()
                })

                const updatedRound = await roundRepository.findOne({
                    where: { id: socket.data.gameId }
                })

                io.to(`game-${socket.data.gameId}`).emit("updateState", {
                    status: "SELECT_ANSWER",
                    phase: "BUZZER",
                    selected_team: null,
                    selected_answer: null,
                    selected_category: question.category.id,
                    selected_question: question.id,
                    current_question_number: updatedRound.current_question_number
                })
            } catch (error) {
                socket.emit("error", error)
            }
        })

        socket.on('submitAnswer', async () => {
            try {
                await roundRepository.update({id: socket.data.gameId}, {
                    status: "SHOW_ANSWER"
                })

                const round = await roundRepository.findOne({where: {id: socket.data.gameId}})

                const isCorrect = round.selected_answer ? (await answerRepository.exists({
                    where: {
                        id: round.selected_answer,
                        question: { id: round.selected_question },
                        is_correct: true
                    },
                })) : false

                // Change points
                // Normal +10 -5
                // Buzzer +20 -10
                if(round.selected_team) {
                    const teamScore = {}
                    if(isCorrect) {
                        teamScore[round.selected_team]
                            = round.phase == "BUZZER" ? 20 : 10
                    } else {
                        teamScore[round.selected_team]
                            = round.phase == "BUZZER" ? -10 : -5
                    }

                    await updateTeamPoints(true, teamScore, socket)
                }

                await roundQuestionRepository.insert({
                    round_id: round.id,
                    question_id: round.selected_question,
                    team_id: round.selected_team,
                    answer_id: round.selected_answer
                })

                io.to(`game-${socket.data.gameId}`).emit("revealAnswer")
                io.to(`game-${socket.data.gameId}`).emit("updateState", {
                    status: "SHOW_ANSWER"
                })
            } catch (error) {
                socket.emit("error", error)
            }
        })

        socket.on('updateTeamPoints', async (increase: boolean, val: Object) => {
            try {
                await updateTeamPoints(increase, val, socket)
            } catch (error) {
                socket.emit("error", error)
            }
        })
    })

    return io
}

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io
}