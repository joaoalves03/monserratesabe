import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {Category} from "./Category.js"
import {Answer, CreateQuestionAnswerSchema} from "./Answer.js"
import {z} from "zod"

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text", { default: "" })
    question!: string

    @Column("text", { nullable: true })
    image_url?: string

    @ManyToOne(() => Category, category => category.questions, { onDelete: 'RESTRICT' })
    category!: Category

    @OneToMany(() => Answer, answer => answer.question)
    answers!: Answer[]
}

export const CreateQuestionSchema = z.object({
    question: z.string(),
    image_url: z.string().nullable().optional(),
    category_id: z.number({ required_error: "Category ID is required" }),
    answers: z.array(CreateQuestionAnswerSchema).min(1, "At least one answer is required")
})

export const UpdateQuestionSchema = z.object({
    question: z.string().min(1).optional(),
    image_url: z.string().nullable().optional(),
    category_id: z.number().optional()
})