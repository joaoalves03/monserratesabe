import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {Question} from "./Question.js"
import {z} from "zod"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 255 })
    name!: string

    @OneToMany(() => Question, question => question.category)
    questions!: Question[]
}

export const CategorySchema = z.object({
    name: z.string().max(128),
})