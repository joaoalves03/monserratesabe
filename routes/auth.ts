import express from "express"
import 'dotenv/config'
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import dotenv from 'dotenv'
import {requireAdmin} from "../middleware/requireAdmin.js"
import {AppDataSource} from "../data-source.js"
import {User} from "../entities/User.js"

dotenv.config()

const userRepository = AppDataSource.getRepository(User)

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        callbackURL: process.env.GOOGLE_CALLBACK_URL ?? ""
    },
    async function(accessToken, refreshToken, profile, cb) {
        let [users, count] = await userRepository.findAndCount()

        if(count == 0 || users.find((x) => x.email == profile.emails![0].value)) {
            const user = new User()

            user.googleId = profile.id
            user.name = profile.displayName
            user.email = profile.emails![0].value
            user.photo = profile.photos![0].value

            await AppDataSource.manager.save(user)

            cb(null, user)
        } else {
            cb(null, null)
        }
    }
))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((userinfo: Express.User, done) => {
    done(null, userinfo)
})

const router = express.Router()

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/?authError=true'
}), (req, res) => {
    res.redirect('/')
})

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        res.redirect("/")
    })
})

router.post("/admin", requireAdmin, async (req, res) => {
    const email: string | undefined = req.body.email

    if(!email) {
        res.sendStatus(400)
        return
    }

    const user = await userRepository.findOneBy({ email: email })

    if(!user) {
        const newUser = new User()
        newUser.googleId = ""
        newUser.name = ""
        newUser.email = email
        newUser.photo = ""

        await AppDataSource.manager.save(newUser)

        res.sendStatus(200)
    } else {
        res.sendStatus(409)
    }
})

export default router

