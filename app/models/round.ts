import {TeamDTO} from "@/models/teamDTO.js"

export interface Round {
    id: number,
    name: string,
    phase: string,
    round_date: string,
    round_game: number,
    status: string,
    selected_team: number,
    selected_question: number,
    selected_category: number,
    selected_answer: number,
    current_question_number: number,
    max_questions: number,
    round_teams: TeamDTO[]
}