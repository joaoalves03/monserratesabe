import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm"
import {Question} from "./Question.js"
import {Team} from "./Team.js"
import {Answer} from "./Answer.js"
import {Round} from "./Round.js"

@Entity()
export class RoundQuestion {
    @PrimaryColumn("int")
    round_id!: number

    @PrimaryColumn("int")
    question_id!: number

    @PrimaryColumn("int")
    team_id!: number

    @Column("int")
    answer_id!: number

    @Column("int")
    round_game!: number

    @ManyToOne(() => Round, round => round.round_questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "round_id" })
    round!: Round

    @ManyToOne(() => Question, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: "question_id" })
    question!: Question

    @ManyToOne(() => Team, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: "team_id" })
    team!: Team

    @ManyToOne(() => Answer, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: "answer_id" })
    answer!: Answer
}