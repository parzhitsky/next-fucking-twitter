import { IsNotEmpty, IsString } from "class-validator"

// Used as both req body validation and response type
export class HasRefreshToken {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken!: string
}
