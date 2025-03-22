import { Server } from 'socket.io'
import { Server as HttpServer } from "node:http"

let io: Server

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
        socket.on('joinGame', (gameId) => {
            socket.join(`game-${gameId}`)

            // TODO: return game state

            socket.emit("hi")
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