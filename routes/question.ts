import express from "express"
import errorHandler from "../errorHandler.js"
import {CreateQuestionSchema, Question, UpdateQuestionSchema} from "../entities/Question.js"
import {AppDataSource} from "../data-source.js"
import {Category} from "../entities/Category.js"
import {requireAdmin} from "../middleware/requireAdmin.js"
import {Round} from "../entities/Round.js"
import {Answer} from "../entities/Answer.js"
import {seededShuffle} from "../util.js"

const router = express.Router()

router.use(errorHandler)

const questionRepository = AppDataSource.getRepository(Question)
const categoryRepository = AppDataSource.getRepository(Category)
const roundRepository = AppDataSource.getRepository(Round)
const answerRepository = AppDataSource.getRepository(Answer)

router.get('/', async (req, res) => {
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

router.get('/by-round/:id/:roundId', async (req, res) => {
    try {
        const isAuthenticated = req.isAuthenticated()

        const id = parseInt(req.params.id)
        const question = await questionRepository.findOne({
            where: { id },
            relations: ['category', 'answers']
        })

        if (!question) {
            res.status(404).json({ message: 'Question not found' })
            return
        }

        const responseQuestion = { ...question }

        if (!isAuthenticated && responseQuestion.answers) {
            responseQuestion.answers = responseQuestion.answers.map(answer => {
                return {
                    ...answer,
                    is_correct: undefined
                }
            })
        }

        const round = await roundRepository
            .createQueryBuilder('round')
            .where('round.id = :id', { id: Number(req.params.roundId) })
            .addSelect('round.answer_shuffle_seed')
            .getOne()

        responseQuestion.answers = seededShuffle(responseQuestion.answers, round.answer_shuffle_seed)

        res.status(200).json(responseQuestion)
    } catch (error) {
        console.error('Error fetching question:', error)
        res.status(500).json({ message: 'Failed to fetch question' })
    }
})

router.get('/round_answers/:id', async (req, res) => {
    try {
        const round = await roundRepository.findOne({where: { id: Number(req.params.id) }})

        if(round.status != "SHOW_ANSWER") {
            res.sendStatus(401)
            return
        }

        const correctAnswers = (await answerRepository.find({
            where: {
                question: { id: round.selected_question },
                is_correct: true
            },
        })).map(x => x.id)

        res.status(200).json(correctAnswers)
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