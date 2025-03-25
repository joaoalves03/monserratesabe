import {Category} from "./category.js"
import {Answer} from "./answer.js"

export interface Question {
    id: number
    question: string
    image_url?: string
    category: Category
    answers: Answer[]
}