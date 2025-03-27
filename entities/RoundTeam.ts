import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm"
import {Team} from "./Team.js"
import {Round} from "./Round.js"

@Entity()
export class RoundTeam {
    @PrimaryColumn("int")
    round_id!: number

    @PrimaryColumn("int")
    team_id!: number

    @Column("int", {
        default: 0,
        transformer: {
            from: (value: number) => value,
            to: (value: number) => Math.max(0, value)
        }
    })
    score!: number

    @Column("int", { default: 0 })
    order!: number

    @ManyToOne(() => Round, round => round.round_teams, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "round_id" })
    round!: Round

    @ManyToOne(() => Team, team => team.round_teams, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: "team_id" })
    team!: Team

    @Column("varchar", { default: "#000000" })
    color!: string
}