import express from "express"
import authRoutes from './auth.js'
import categoryRoutes from './category.js'
import questionRoutes from './question.js'
import answerRoutes from './answer.js'
import teamRoutes from './team.js'
import teamMemberRoutes from './team_member.js'
import roundRoutes from './round.js'
import {requireAdmin} from "../middleware/requireAdmin.js"

const router = express.Router()

router.use("/auth", authRoutes)
router.use("/category", categoryRoutes)
router.use("/question", questionRoutes)
router.use("/answer", answerRoutes)
router.use("/team", teamRoutes)
router.use("/team-member", teamMemberRoutes)
router.use("/round", roundRoutes)

router.get("/profile", requireAdmin, async (req, res) => {
    // @ts-ignore
    const user: {googleId: string, name: string, email: string, photo: string} = req.user!

    res.send({
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        photo: user.photo
    })
})

export default router