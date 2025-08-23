import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
  })
  readonly id!: string

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  readonly createdAt!: Date

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
