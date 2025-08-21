import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

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
}
