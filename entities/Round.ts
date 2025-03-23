import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {RoundTeam} from "./RoundTeam.js"
import {RoundCategory} from "./RoundCategory.js"
import {RoundQuestion} from "./RoundQuestion.js"
import {z} from "zod"

export type GameStatus =
    | "SELECT_PHASE"
    | "SELECT_OPTIONS"
    | "SELECT_TEAM"
    | "SELECT_ANSWER"
    | "SHOW_ANSWER"
    | "SHOW_TEAMS"
    | "SHOW_WINNER"

export type GamePhase =
    | "QUESTIONS"
    | "TEAM_CHALLENGE"
    | "BUZZER"

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("varchar")
    name!: string

    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    round_date!: Date

    @Column({
        type: "varchar",
        default: "SELECT_PHASE",
    })
    status!: GameStatus

    @Column({
        type: "varchar",
        nullable: true,
    })
    phase!: GamePhase | null

    @Column("int", { nullable: true })
    selected_team!: number

    @Column("int", { nullable: true })
    selected_question!: number

    @Column("int", { nullable: true })
    selected_category!: number

    @Column("int", { nullable: true })
    selected_answer!: number

    @Column("int", { default: 0 })
    round_game!: number

    @OneToMany(() => RoundQuestion, roundQuestion => roundQuestion.round)
    round_questions!: RoundQuestion[]

    @OneToMany(() => RoundTeam, roundTeam => roundTeam.round)
    round_teams!: RoundTeam[]

    @OneToMany(() => RoundCategory, roundCategory => roundCategory.round)
    round_categories!: RoundCategory[]
}

export const roundSchema = z.object({
    name: z.string().min(1, "Round name is required"),
    team_ids: z.array(z.number().int()).min(2)
})