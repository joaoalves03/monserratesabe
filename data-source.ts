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
    host: "localhost",
    port: 5432,
    username: "monserratesabe",
    password: "monserratesabe",
    database: "monserratesabe",
    synchronize: true,
    logging: true,
    entities: [User, Answer, Category, Question, Round, RoundCategory, RoundQuestion, RoundTeam, Team, TeamMember],
})