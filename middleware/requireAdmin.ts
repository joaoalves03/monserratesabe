import {NextFunction} from "express"
import {AppDataSource} from "../data-source.js"
import {User} from "../entities/User.js"

export async function requireAdmin(req: any, res: any, next: NextFunction) {
    const userRepository = AppDataSource.getRepository(User)

    if (req.isAuthenticated() && await userRepository.findOneBy({googleId: req.user!.googleId})) {
        return next()
    }
    return res.sendStatus(401)
}