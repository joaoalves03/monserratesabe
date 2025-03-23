import { Server } from 'socket.io'
import { Server as HttpServer } from "node:http"
import {AppDataSource} from "./data-source.js"
import {Round} from "./entities/Round.js"
import type {GamePhase} from "./entities/Round.js"

let io: Server

export const initIO = (httpServer: HttpServer) => {
    const roundRepository = AppDataSource.getRepository(Round)

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
            const round = roundRepository.findOne({where: {id: socket.data.gameId}})

            await roundRepository.update({id: socket.data.gameId}, {
                ...round,
                ...data
            })

            io.to(`game-${socket.data.gameId}`).emit("updateState", data)
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