import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { PasswordHash } from "@/common/password-hash.js"

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  readonly id!: string

  @Column({
    name: 'alias',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  readonly alias!: string

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  readonly passwordHash!: PasswordHash
}
