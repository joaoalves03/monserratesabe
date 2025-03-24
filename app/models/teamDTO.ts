import {Team} from "@/models/team.js"

export interface TeamDTO {
    score: number,
    team: Team,
    color: string
}