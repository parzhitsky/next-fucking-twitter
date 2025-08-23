import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "@/users/user.entity.js"

export const TEXT_MAX_LENGTH = 280

@Entity('tweet')
export class Tweet {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  readonly id!: string

  @Column({
    name: 'text',
    type: 'varchar',
    length: 280,
    nullable: false,
  })
  readonly text!: string

  @Column({
    name: 'created_by_id',
    type: 'uuid',
    nullable: false,
  })
  readonly createdById!: string

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
  })
  readonly createdBy!: User

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  readonly createdAt!: Date
}
