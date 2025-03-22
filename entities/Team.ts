import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {TeamMember} from "./TeamMember.js"
import {RoundTeam} from "./RoundTeam.js"
import {z} from "zod"

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 255 })
    team_name!: string

    @OneToMany(() => TeamMember, member => member.team)
    members!: TeamMember[]

    @OneToMany(() => RoundTeam, roundTeam => roundTeam.team)
    round_teams!: RoundTeam[]
}

export const CreateTeamSchema = z.object({
    team_name: z.string().min(1, "Team name is required")
})

export const UpdateTeamSchema = z.object({
    team_name: z.string().min(1).optional()
})