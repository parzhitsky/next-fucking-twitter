import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { User } from '@/users/user.entity.js'

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  readonly id!: string

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  readonly userId!: string

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  readonly user!: Promise<User | null>

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  readonly createdAt!: Date

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  readonly expiresAt!: Date

  @Column({
    name: 'generated_from_id',
    type: 'uuid',
    nullable: true,
  })
  readonly generatedFromId!: string | null

  @OneToOne(() => RefreshToken)
  @JoinColumn({
    name: 'generated_from_id',
    referencedColumnName: 'id',
  })
  readonly generatedFrom!: Promise<RefreshToken | null>

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null
}
