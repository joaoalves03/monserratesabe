import {DataSource} from "typeorm"
import {Category} from "./entities/Category.js"
import {Question} from "./entities/Question.js"
import {Answer} from "./entities/Answer.js"
import {Round} from "./entities/Round.js"
import {RoundCategory} from "./entities/RoundCategory.js"
import {RoundQuestion} from "./entities/RoundQuestion.js"
import {RoundTeam} from "./entities/RoundTeam.js"
import {Team} from "./entities/Team.js"
import {TeamMember} from "./entities/TeamMember.js"
import {User} from "./entities/User.js"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port:  Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER || "monserratesabe",
    password: process.env.POSTGRES_PASSWORD || "monserratesabe",
    database: process.env.POSTGRES_DB || "monserratesabe",
    synchronize: true,
    logging: true,
    entities: [User, Answer, Category, Question, Round, RoundCategory, RoundQuestion, RoundTeam, Team, TeamMember],
})