import { Transform } from 'class-transformer'
import { IsIn, IsOptional } from 'class-validator'

export const defaults = {
  nosignin: false,
} satisfies Partial<SignUpReqQuery>

export class SignUpReqQuery {
  @IsOptional()
  @Transform(({ value }) => Boolean(Number(value)))
  @IsIn(['0', '1', 0, 1, true, false])
  readonly nosignin: boolean = defaults.nosignin
}
