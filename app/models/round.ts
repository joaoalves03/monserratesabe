import {Team} from "./team.js"

export interface Round {
    id: number,
    name: string,
    phase: string,
    round_date: string,
    round_game: number,
    status: string,
    round_teams: Team[]
}