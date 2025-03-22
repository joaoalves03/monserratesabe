import {Column, Entity, PrimaryColumn} from "typeorm"

@Entity()
export class User {
    @PrimaryColumn("varchar")
    googleId!: string

    @Column({ type: "varchar", length: 255 })
    name!: string

    @Column({ type: "varchar", length: 255 })
    email!: string

    @Column({ type: "text" })
    photo!: string
}