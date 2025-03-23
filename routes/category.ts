import express from "express"
import errorHandler from "../errorHandler.js"
import {AppDataSource} from "../data-source.js"
import {Category, CategorySchema} from "../entities/Category.js"
import {requireAdmin} from "../middleware/requireAdmin.js"
import {Round} from "../entities/Round.js"
import {RoundCategory} from "../entities/RoundCategory.js"

const router = express.Router()

router.use(errorHandler)

router.get("/", async (req, res) => {
    const categoryRepository = AppDataSource.getRepository(Category)

    res.send(await categoryRepository.find())
})

router.get("/used/:id", async (req, res) => {
    const roundCategoryRepository = AppDataSource.getRepository(RoundCategory)
    const roundRepository = AppDataSource.getRepository(Round)

    const round = await roundRepository.findOne({where: {id: Number(req.params.id)}})

    const roundCategories = await roundCategoryRepository.find({where: {
        round_id: Number(req.params.id),
        team_id: round.selected_team,
        round_game: round.round_game
    }})

    res.send(roundCategories.map((x) => x.category_id))
})

router.post("/", requireAdmin, async (req, res) => {
    try {
        const validatedData = CategorySchema.parse(req.body)

        const category = new Category()
        category.name = validatedData.name

        await AppDataSource.manager.save(category)

        res.sendStatus(200)
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