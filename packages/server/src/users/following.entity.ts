import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { User } from "./user.entity.js"

@Entity('following')
export class Following {
  @Column({
    name: 'follower_id',
    type: 'uuid',
    primary: true,
  })
  readonly followerId!: string

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'follower_id',
    referencedColumnName: 'id',
  })
  readonly follower!: User

  @Column({
    name: 'followee_id',
    type: 'uuid',
    primary: true,
  })
  readonly followeeId!: string

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'followee_id',
    referencedColumnName: 'id',
  })
  readonly followee!: User
}
