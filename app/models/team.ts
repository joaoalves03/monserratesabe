import {TeamMember} from "../../entities/TeamMember.js"

export interface Team {
    id: number
    team_name: string
    members: TeamMember[]
}