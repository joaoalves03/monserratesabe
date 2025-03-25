import express from "express"
import errorHandler from "../errorHandler.js"
import {AppDataSource} from "../data-source.js"
import {Category, CategorySchema} from "../entities/Category.js"
import {requireAdmin} from "../middleware/requireAdmin.js"
import {Round} from "../entities/Round.js"
import {RoundCategory} from "../entities/RoundCategory.js"
import {RoundQuestion} from "../entities/RoundQuestion.js"
import {Question} from "../entities/Question.js"

const router = express.Router()

router.use(errorHandler)

router.get("/", async (req, res) => {
    const categoryRepository = AppDataSource.getRepository(Category)

    res.send(await categoryRepository.find())
})

router.get("/:id", async (req, res) => {
    const categoryRepository = AppDataSource.getRepository(Category)

    res.send(await categoryRepository.findOne({where: {id: Number(req.params.id)}}))
})

router.get("/used/:id", async (req, res) => {
    const roundCategoryRepository = AppDataSource.getRepository(RoundCategory)
    const questionRepository = AppDataSource.getRepository(Question)
    const categoryRepostory = AppDataSource.getRepository(Category)
    const roundRepository = AppDataSource.getRepository(Round)

    const round = await roundRepository.findOne({where: {id: Number(req.params.id)}})

    const unavailableCategories = (await roundCategoryRepository.find({where: {
        round_id: Number(req.params.id),
        team_id: round.selected_team,
        round_game: round.round_game
    }})).map(x => x.category_id)

    const categories = await categoryRepostory.find()

    const hasNoMoreQuestions = async (categoryId: number) => {
        const unusedQuestions = await questionRepository.createQueryBuilder("question")
            .leftJoin(
                RoundQuestion,
                "round_question",
                "round_question.question_id = question.id AND round_question.round_id = :roundId AND round_question.team_id = :teamId",
                { roundId: round?.id, teamId: round?.selected_team }
            )
            .where("question.category.id = :categoryId", { categoryId })
            .andWhere("round_question.question_id IS NULL")
            .getCount()

        return unusedQuestions === 0
    }

    for (const category of categories) {
        if (await hasNoMoreQuestions(category.id)) {
            unavailableCategories.push(category.id)
        }
    }

    res.send(unavailableCategories)
})

router.post("/", requireAdmin, async (req, res) => {
    try {
        const validatedData = CategorySchema.parse(req.body)

        const category = new Category()
        category.name = validatedData.name

        await AppDataSource.manager.save(category)

        res.status(201).json(category)
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

router.put("/:id", requireAdmin, async (req, res) => {
    try {
        const validatedData = CategorySchema.parse(req.body)
        const categoryRepository = AppDataSource.getRepository(Category)

        const category = await categoryRepository.findOneBy({
            id: Number.parseInt(req.params.id)
        })

        category.name = validatedData.name

        await AppDataSource.manager.save(category)
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const categoryRepository = AppDataSource.getRepository(Category)

        const category = await categoryRepository.findOneBy({
            id: Number.parseInt(req.params.id)
        })

        await AppDataSource.manager.remove(category)
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

export default router