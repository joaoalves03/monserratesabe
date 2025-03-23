import { Server } from 'socket.io'
import { Server as HttpServer } from "node:http"
import {AppDataSource} from "./data-source.js"
import {GameStatus, Round} from "./entities/Round.js"
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

        socket.on('updateStatus', async (key: string) => {
            await roundRepository.update({id: socket.data.gameId}, {
                status: key as GameStatus
            })

            io.to(`game-${socket.data.gameId}`).emit("updateState", {
                status: key
            })
        })

        socket.on('updateSelectedTeam', async (id: number | undefined) => {
            await roundRepository.update({id: socket.data.gameId}, {
                selected_team: id
            })

            io.to(`game-${socket.data.gameId}`).emit("updateState", {
                selected_team: id
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