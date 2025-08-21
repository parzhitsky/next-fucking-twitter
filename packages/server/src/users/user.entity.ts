import { Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  readonly id!: string

  // TODO: …
}
