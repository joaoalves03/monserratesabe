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

    @Column("int", { default: 0 })
    current_question_number!: number

    @Column("int", { default: 0 })
    max_questions!: number

    @OneToMany(() => RoundQuestion, roundQuestion => roundQuestion.round)
    round_questions!: RoundQuestion[]

    @OneToMany(() => RoundTeam, roundTeam => roundTeam.round)
    round_teams!: RoundTeam[]

    @OneToMany(() => RoundCategory, roundCategory => roundCategory.round)
    round_categories!: RoundCategory[]
}

const colors = [
    '#f84a4a', '#269cfd', '#26d63c',
    '#ff3dee', '#D4A5A5', '#9B89B3'
]

export const roundSchema = z.object({
    name: z.string().min(1, "Round name is required"),
    teams: z.array(
        z.object({
            team_id: z.number().int(),
            color: z.string().refine(
                val => colors.includes(val),
                "Invalid team color"
            )
        })
    )
    .min(3, "Minimum 3 teams required")
    .max(6, "Maximum 6 teams allowed")
    .refine(
        teams => new Set(teams.map(t => t.color)).size === teams.length,
        "Colors must be unique"
    )
    .refine(
        teams => new Set(teams.map(t => t.team_id)).size === teams.length,
        "Teams must be unique"
    )
})