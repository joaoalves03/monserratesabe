import express from "express"
import errorHandler from "../errorHandler.js"
import {AppDataSource} from "../data-source.js"
import {Round, roundSchema} from "../entities/Round.js"
import {requireAdmin} from "../middleware/requireAdmin.js"
import {RoundTeam} from "../entities/RoundTeam.js"
import {Team} from "../entities/Team.js"

const router = express.Router()

router.use(errorHandler)

const roundRepository = AppDataSource.getRepository(Round)

router.get("/", async (req, res) => {
    try {
        const rounds = await roundRepository.find({
            relations: [
                'round_questions',
                'round_teams',
                'round_teams.team',
                'round_categories'
            ],
            order: { round_teams: { order: "ASC" } }
        })

        res.status(200).json(rounds)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch rounds' })
    }
})

router.post("/", requireAdmin, async (req, res) => {
    try {
        const result = roundSchema.safeParse(req.body)

        if (!result.success) {
            res.status(400).json({
                message: 'Invalid input data',
                errors: result.error.format()
            })
            return
        }

        const { name, teams } = result.data

        const newRound = new Round()
        newRound.name = name
        newRound.status = "SELECT_PHASE"

        const savedRound = await roundRepository.save(newRound)

        const teamRepository = AppDataSource.getRepository(Team)
        const roundTeamRepository = AppDataSource.getRepository(RoundTeam)

        for(let team of teams) {
            if(!await teamRepository.exists({where: {id: team.team_id}})) {
                await roundRepository.remove(savedRound)
                res.status(400).json({ message: 'One or more teams do not exist' })
                return
            }
        }

        const roundTeams = teams.map((team, index) => {
            const roundTeam = new RoundTeam()
            roundTeam.round = savedRound
            roundTeam.team_id = team.team_id
            roundTeam.color = team.color
            roundTeam.order = index
            return roundTeam
        })

        await roundTeamRepository.save(roundTeams)

        const completeRound = await roundRepository.findOne({
            where: { id: savedRound.id },
            relations: ['round_teams'],
            order: {
                round_teams: {
                    order: "ASC"
                },
            }
        })

        res.status(201).json(completeRound)
    } catch (error) {
        console.error('Failed to create round:', error)
        res.status(500).json({ message: 'Failed to create round' })
    }
})

export default router