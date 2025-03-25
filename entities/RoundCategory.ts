import {Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm"
import {Round} from "./Round.js"
import {Team} from "./Team.js"
import {Category} from "./Category.js"

@Entity()
export class RoundCategory {
    @PrimaryColumn("int")
    round_id!: number

    @PrimaryColumn("int")
    category_id!: number

    @PrimaryColumn("int")
    team_id!: number

    @PrimaryColumn("int", {default: 1})
    round_game!: number

    @ManyToOne(() => Round, round => round.round_categories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "round_id" })
    round!: Round

    @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: "category_id" })
    category!: Category

    @ManyToOne(() => Team, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: "team_id" })
    team!: Team
}