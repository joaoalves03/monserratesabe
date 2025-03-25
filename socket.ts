import {Server} from 'socket.io'
import { Server as HttpServer } from "node:http"
import {AppDataSource} from "./data-source.js"
import {Round} from "./entities/Round.js"
import type {GamePhase} from "./entities/Round.js"
import {Question} from "./entities/Question.js"
import {RoundQuestion} from "./entities/RoundQuestion.js"
import {RoundTeam} from "./entities/RoundTeam.js"
import {Answer} from "./entities/Answer.js"

let io: Server

const roundRepository = AppDataSource.getRepository(Round)
const roundTeamRepository = AppDataSource.getRepository(RoundTeam)
const questionRepository = AppDataSource.getRepository(Question)
const answerRepository = AppDataSource.getRepository(Answer)

async function updateTeamPoints(increase: boolean, val: Object, socket: any) {
    for(let index of Object.keys(val)) {
        await roundTeamRepository.update(
            {
                team_id: Number(index),
                round_id: Number(socket.data.gameId)
            },
            {
                score: increase ? () => `score + ${val[index]}` : val[index]
            }
        )
    }

    io.to(`game-${socket.data.gameId}`)
        .emit("updateState",
            await roundRepository.findOne({
                where: {id: socket.data.gameId}, relations: [
                    'round_questions',
                    'round_teams',
                    'round_teams.team',
                    'round_teams.team.members',
                    'round_categories'
                ]
            }))
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
            socket.join(`game-${gameId}`)
            socket.data.gameId = gameId

            const round = await roundRepository.findOne({where: {id: gameId}, relations: [
                'round_questions',
                'round_teams',
                'round_teams.team',
                'round_teams.team.members',
                'round_categories'
            ]})

            socket.emit("updateState", round)
        })

        socket.on('updatePhase', async (key: string) => {
            await roundRepository.update({id: socket.data.gameId}, {
                status: "SELECT_TEAM",
                phase: key as GamePhase,
            })

            io.to(`game-${socket.data.gameId}`).emit("updateState", {
                status: "SELECT_TEAM",
                phase: key
            })
        })

        socket.on('updateRound', async(data: Partial<Round>) => {
            const round = await roundRepository.findOne({where: {id: socket.data.gameId}})

            await roundRepository.update({id: socket.data.gameId}, {
                ...round,
                ...data
            })

            io.to(`game-${socket.data.gameId}`).emit("updateState", data)
        })

        socket.on('launchQuestion', async() => {
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

            const updatedRound = await roundRepository.findOne({
                where: { id: socket.data.gameId }
            })

            io.to(`game-${socket.data.gameId}`).emit("updateState", {
                status: "SELECT_ANSWER",
                selected_question: question.id,
                selected_answer: null,
                current_question_number: updatedRound.current_question_number
            })
        })

        socket.on('launchBuzzerQuestion', async() => {
            const round = await roundRepository.findOne({where: {id: socket.data.gameId}})
            const question = await questionRepository
                .createQueryBuilder('question')
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
                phase: "BUZZER",
                selected_team: null,
                selected_answer: null,
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
                selected_question: question.id,
                current_question_number: updatedRound.current_question_number
            })
        })

        socket.on('submitAnswer', async () => {
            await roundRepository.update({id: socket.data.gameId}, {
                status: "SHOW_ANSWER"
            })

            const round = await roundRepository.findOne({where: {id: socket.data.gameId}})

            const isCorrect = (await answerRepository.exists({
                where: {
                    id: round.selected_answer,
                    question: { id: round.selected_question },
                    is_correct: true
                },
            }))

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

            io.to(`game-${socket.data.gameId}`).emit("revealAnswer")
            io.to(`game-${socket.data.gameId}`).emit("updateState", {
                status: "SHOW_ANSWER"
            })
        })

        socket.on('updateTeamPoints', async (increase: boolean, val: Object) => {
            await updateTeamPoints(increase, val, socket)
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