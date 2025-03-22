import express from "express"
import errorHandler from "../errorHandler.js"
import {Answer, CreateAnswerSchema, UpdateAnswerSchema} from "../entities/Answer.js"
import {Question} from "../entities/Question.js"
import {AppDataSource} from "../data-source.js"
import {requireAdmin} from "../middleware/requireAdmin.js"

const router = express.Router()

router.use(errorHandler)

const answerRepository = AppDataSource.getRepository(Answer)
const questionRepository = AppDataSource.getRepository(Question)

router.post('/', requireAdmin, async (req, res) => {
    try {
        const validationResult = CreateAnswerSchema.parse(req.body)

        const { answer_text, is_correct, question_id } = validationResult

        const question = await questionRepository.findOneBy({ id: question_id })

        if (!question) {
            res.status(404).json({ message: 'Question not found' })
            return
        }

        const newAnswer = answerRepository.create({
            answer_text,
            is_correct,
            question
        })

        await answerRepository.save(newAnswer)

        res.status(201).json(newAnswer)
    } catch (error) {
        console.error('Error creating answer:', error)
        res.status(500).json({ message: 'Failed to create answer' })
    }
})

router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const answer = await answerRepository.findOneBy({ id })

        if (!answer) {
            res.status(404).json({ message: 'Answer not found' })
            return
        }

        const validationResult = UpdateAnswerSchema.safeParse(req.body)

        if (!validationResult.success) {
            res.status(400).json({
                message: 'Invalid answer data',
                errors: validationResult.error.format()
            })
            return
        }

        const { answer_text, is_correct } = validationResult.data

        if (answer_text !== undefined) {
            answer.answer_text = answer_text
        }

        if (is_correct !== undefined) {
            answer.is_correct = is_correct
        }

        await answerRepository.save(answer)

        res.status(200).json(answer)
    } catch (error) {
        console.error('Error updating answer:', error)
        res.status(500).json({ message: 'Failed to update answer' })
    }
})

router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const answer = await answerRepository.findOneBy({ id })

        if (!answer) {
            res.status(404).json({ message: 'Answer not found' })
            return
        }

        await answerRepository.remove(answer)

        res.status(204).send()
    } catch (error) {
        console.error('Error deleting answer:', error)
        res.status(500).json({ message: 'Failed to delete answer' })
    }
})

export default router