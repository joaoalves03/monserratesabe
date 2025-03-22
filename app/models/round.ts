import {Team} from "./team.js"

export interface Round {
    id: number,
    name: string,
    round_teams: Team[]
}