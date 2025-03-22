import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {Question} from "./Question.js"
import {z} from "zod"

@Entity("answers")
export class Answer {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    answer_text!: string

    @Column("boolean", { default: false })
    is_correct!: boolean

    @ManyToOne(() => Question, question => question.answers, { onDelete: 'CASCADE' })
    question!: Question
}

export const CreateAnswerSchema = z.object({
    answer_text: z.string().min(1, "Answer text is required"),
    is_correct: z.boolean().default(false),
    question_id: z.number({ required_error: "Question ID is required" })
})

export const UpdateAnswerSchema = z.object({
    answer_text: z.string().min(1).optional(),
    is_correct: z.boolean().optional()
})