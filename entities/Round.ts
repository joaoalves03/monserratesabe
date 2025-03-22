import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {RoundTeam} from "./RoundTeam.js"
import {RoundCategory} from "./RoundCategory.js"
import {RoundQuestion} from "./RoundQuestion.js"
import {z} from "zod"

export enum GameState {
    SELECT_PHASE,
    SELECT_OPTIONS,
    SELECT_TEAM,
    SELECT_ANSWER,
    SHOW_ANSWER,
    TEAM_CHALLENGE,
    SHOW_WINNER
}

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("varchar")
    name!: string

    @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
    round_date!: Date

    @Column({
        type: "enum",
        enum: GameState,
        default: GameState.SELECT_PHASE,
    })
    status!: GameState

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
    team_ids: z.array(z.number().int().positive()).min(2)
})