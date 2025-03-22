import express from "express"
import errorHandler from "../errorHandler.js"
import {AppDataSource} from "../data-source.js"
import {Category, CategorySchema} from "../entities/Category.js"
import {requireAdmin} from "../middleware/requireAdmin.js"

const router = express.Router()

router.use(errorHandler)

router.get("/", requireAdmin, async (req, res) => {
    const categoryRepository = AppDataSource.getRepository(Category)

    res.send(await categoryRepository.find())
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