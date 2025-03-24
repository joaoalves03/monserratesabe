import { Server } from 'socket.io'
import { Server as HttpServer } from "node:http"
import {AppDataSource} from "./data-source.js"
import {Round} from "./entities/Round.js"
import type {GamePhase} from "./entities/Round.js"
import {Question} from "./entities/Question.js"
import {RoundQuestion} from "./entities/RoundQuestion.js"

let io: Server

export const initIO = (httpServer: HttpServer) => {
    const roundRepository = AppDataSource.getRepository(Round)
    const questionRepository = AppDataSource.getRepository(Question)

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
                        .andWhere('rq.round_game = :roundGame', { roundGame: round.round_game })
                        .getQuery()
                    return `question.id NOT IN ${subQueryBuilder}`
                })
                .orderBy('RANDOM()')
                .limit(1)
                .getOne();

            await roundRepository.update({id: socket.data.gameId}, {
                status: "SELECT_ANSWER",
                selected_question: question.id
            })

            io.to(`game-${socket.data.gameId}`).emit("updateState", {
                status: "SELECT_ANSWER",
                selected_question: question.id
            })
        })

        socket.on('submitAnswer', async () => {
            // TODO: MODIFY TEAM POINTS

            await roundRepository.update({id: socket.data.gameId}, {
                status: "SHOW_ANSWER"
            })

            io.to(`game-${socket.data.gameId}`).emit("revealAnswer")
            io.to(`game-${socket.data.gameId}`).emit("updateState", {
                status: "SHOW_ANSWER"
            })
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