import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {Team} from "./Team.js"
import {z} from "zod"

@Entity()
export class TeamMember {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 255 })
    member_name!: string

    @ManyToOne(() => Team, team => team.members, { onDelete: 'CASCADE' })
    team!: Team
}

export const CreateTeamMemberSchema = z.object({
    member_name: z.string().min(1, "Member name is required"),
    team_id: z.number({ required_error: "Team ID is required" })
})

export const UpdateTeamMemberSchema = z.object({
    member_name: z.string().min(1).optional(),
    team_id: z.number().optional()
})