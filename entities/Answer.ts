import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {Question} from "./Question.js"
import {z} from "zod"

@Entity("answers")
export class Answer {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text", { default: "" })
    answer_text!: string

    @Column("text", { nullable: true })
    image_url?: string

    @Column("boolean", { default: false })
    is_correct!: boolean

    @ManyToOne(() => Question, question => question.answers, { onDelete: 'CASCADE' })
    question!: Question
}

export const CreateAnswerSchema = z.object({
    answer_text: z.string(),
    is_correct: z.boolean().default(false),
    image_url: z.string().nullable().optional(),
    question_id: z.number({ required_error: "Question ID is required" })
})

export const CreateQuestionAnswerSchema = z.object({
    answer_text: z.string(),
    is_correct: z.boolean().default(false),
    image_url: z.string().nullable().optional()
})

export const UpdateAnswerSchema = z.object({
    answer_text: z.string().optional(),
    image_url: z.string().nullable().optional(),
    is_correct: z.boolean().optional()
})