import express from "express"
import errorHandler from "../errorHandler.js"
import {CreateQuestionSchema, Question, UpdateQuestionSchema} from "../entities/Question.js"
import {AppDataSource} from "../data-source.js"
import {Category} from "../entities/Category.js"
import {requireAdmin} from "../middleware/requireAdmin.js"

const router = express.Router()

router.use(errorHandler)

const questionRepository = AppDataSource.getRepository(Question)
const categoryRepository = AppDataSource.getRepository(Category)

router.get('/', requireAdmin, async (req, res) => {
    try {
        const questions = await questionRepository.find({
            relations: ['category', 'answers']
        })

        res.status(200).json(questions)
    } catch (error) {
        console.error('Error fetching questions:', error)
        res.status(500).json({ message: 'Failed to fetch questions' })
    }
})

router.get('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const question = await questionRepository.findOne({
            where: { id },
            relations: ['category', 'answers']
        })

        if (!question) {
            res.status(404).json({ message: 'Question not found' })
            return
        }

        res.status(200).json(question)
    } catch (error) {
        console.error('Error fetching question:', error)
        res.status(500).json({ message: 'Failed to fetch question' })
    }
})

router.post('/', requireAdmin, async (req, res) => {
    try {
        const validationResult = CreateQuestionSchema.parse(req.body)
        
        const { question, image_url, category_id } = validationResult

        const category = await categoryRepository.findOneBy({ id: category_id })

        if (!category) {
            res.status(404).json({ message: 'Category not found' })
            return
        }

        const newQuestion = questionRepository.create({
            question,
            image_url,
            category
        })

        await questionRepository.save(newQuestion)

        res.status(201).json(newQuestion)
    } catch (error) {
        console.error('Error creating question:', error)
        res.status(500).json({ message: 'Failed to create question' })
    }
})

router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const question = await questionRepository.findOneBy({ id })

        if (!question) {
            res.status(404).json({ message: 'Question not found' })
            return
        }

        const validationResult = UpdateQuestionSchema.parse(req.body)

        const { question: questionText, image_url, category_id } = validationResult

        if (questionText !== undefined) {
            question.question = questionText
        }

        if (image_url !== undefined) {
            question.image_url = image_url
        }

        if (category_id !== undefined) {
            const category = await categoryRepository.findOneBy({ id: category_id })

            if (!category) {
                res.status(404).json({ message: 'Category not found' })
                return
            }

            question.category = category
        }

        await questionRepository.save(question)

        res.status(200).json(question)
    } catch (error) {
        console.error('Error updating question:', error)
        res.status(500).json({ message: 'Failed to update question' })
    }
})

router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id)

        const question = await questionRepository.findOneBy({ id })

        if (!question) {
            res.status(404).json({ message: 'Question not found' })
            return
        }

        await questionRepository.remove(question)

        res.status(204).send()
    } catch (error) {
        console.error('Error deleting question:', error)
        res.status(500).json({ message: 'Failed to delete question' })
    }
})

export default router