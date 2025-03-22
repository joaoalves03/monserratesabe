import express from "express"
import errorHandler from "../errorHandler.js"
import {AppDataSource} from "../data-source.js"
import {CreateTeamSchema, Team, UpdateTeamSchema} from "../entities/Team.js"
import {requireAdmin} from "../middleware/requireAdmin.js"

const router = express.Router()

router.use(errorHandler)

const teamRepository = AppDataSource.getRepository(Team)

router.get('/', requireAdmin, async (req, res) => {
    try {
        const teams = await teamRepository.find({
            relations: ['members', 'round_teams']
        })

        res.status(200).json(teams)
    } catch (error) {
        console.error('Error fetching teams:', error)
        res.status(500).json({ message: 'Failed to fetch teams' })
    }
})

router.get('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const team = await teamRepository.findOne({
            where: { id },
            relations: ['members', 'round_teams']
        })

        if (!team) {
            res.status(404).json({ message: 'Team not found' })
            return
        }

        res.status(200).json(team)
    } catch (error) {
        console.error('Error fetching team:', error)
        res.status(500).json({ message: 'Failed to fetch team' })
    }
})

router.post('/', requireAdmin, async (req, res) => {
    try {
        const validationResult = CreateTeamSchema.parse(req.body)
        const { team_name } = validationResult

        const newTeam = teamRepository.create({
            team_name
        })

        await teamRepository.save(newTeam)

        res.status(201).json(newTeam)
    } catch (error) {
        console.error('Error creating team:', error)
        res.status(500).json({ message: 'Failed to create team' })
    }
})

router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const team = await teamRepository.findOneBy({ id })

        if (!team) {
            res.status(404).json({ message: 'Team not found' })
            return
        }

        const validationResult = UpdateTeamSchema.parse(req.body)
        const { team_name } = validationResult

        if (team_name !== undefined) {
            team.team_name = team_name
        }

        await teamRepository.save(team)

        res.status(200).json(team)
    } catch (error) {
        console.error('Error updating team:', error)
        res.status(500).json({ message: 'Failed to update team' })
    }
})

router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const team = await teamRepository.findOneBy({ id })

        if (!team) {
            res.status(404).json({ message: 'Team not found' })
            return
        }

        await teamRepository.remove(team)

        res.status(204).send()
    } catch (error) {
        console.error('Error deleting team:', error)
        res.status(500).json({ message: 'Failed to delete team' })
    }
})

export default router