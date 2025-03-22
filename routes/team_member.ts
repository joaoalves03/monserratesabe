import express from "express"
import errorHandler from "../errorHandler.js"
import {AppDataSource} from "../data-source.js"
import {
    CreateTeamMemberSchema,
    TeamMember,
    UpdateTeamMemberSchema
} from "../entities/TeamMember.js"
import {Team} from "../entities/Team.js"
import {requireAdmin} from "../middleware/requireAdmin.js"

const router = express.Router()

router.use(errorHandler)

const teamRepository = AppDataSource.getRepository(Team)
const teamMemberRepository = AppDataSource.getRepository(TeamMember)


router.get('/team-members', requireAdmin, async (req, res) => {
    try {
        const members = await teamMemberRepository.find({
            relations: ['team']
        })

        res.status(200).json(members)
    } catch (error) {
        console.error('Error fetching team members:', error)
        res.status(500).json({ message: 'Failed to fetch team members' })
    }
})

router.get('/team-members/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const member = await teamMemberRepository.findOne({
            where: { id },
            relations: ['team']
        })

        if (!member) {
            res.status(404).json({ message: 'Team member not found' })
            return
        }

        res.status(200).json(member)
    } catch (error) {
        console.error('Error fetching team member:', error)
        res.status(500).json({ message: 'Failed to fetch team member' })
    }
})

router.post('/team-members', requireAdmin, async (req, res) => {
    try {
        const validationResult = CreateTeamMemberSchema.parse(req.body)

        const { member_name, team_id } = validationResult

        const team = await teamRepository.findOneBy({ id: team_id })

        if (!team) {
            res.status(404).json({ message: 'Team not found' })
            return
        }

        const newMember = teamMemberRepository.create({
            member_name,
            team
        })

        await teamMemberRepository.save(newMember)

        res.status(201).json(newMember)
    } catch (error) {
        console.error('Error creating team member:', error)
        res.status(500).json({ message: 'Failed to create team member' })
    }
})

router.put('/team-members/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const member = await teamMemberRepository.findOneBy({ id })

        if (!member) {
            res.status(404).json({ message: 'Team member not found' })
            return
        }

        const validationResult = UpdateTeamMemberSchema.parse(req.body)

        const { member_name, team_id } = validationResult

        if (member_name !== undefined) {
            member.member_name = member_name
        }

        if (team_id !== undefined) {
            const team = await teamRepository.findOneBy({ id: team_id })

            if (!team) {
                res.status(404).json({ message: 'Team not found' })
                return
            }

            member.team = team
        }

        await teamMemberRepository.save(member)

        res.status(200).json(member)
    } catch (error) {
        console.error('Error updating team member:', error)
        res.status(500).json({ message: 'Failed to update team member' })
    }
})

router.delete('/team-members/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const member = await teamMemberRepository.findOneBy({ id })

        if (!member) {
            res.status(404).json({ message: 'Team member not found' })
            return
        }

        await teamMemberRepository.remove(member)

        res.status(204).send()
    } catch (error) {
        console.error('Error deleting team member:', error)
        res.status(500).json({ message: 'Failed to delete team member' })
    }
})

export default router