import { IsNotEmpty, IsString } from "class-validator"

export class UserCreds {
  @IsString()
  @IsNotEmpty()
  readonly userAlias!: string

  @IsString()
  @IsNotEmpty()
  readonly password!: string
}
