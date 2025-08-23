import { IsNotEmpty, IsString } from "class-validator"

export class FollowUserReqParams {
  @IsString()
  @IsNotEmpty()
  readonly followeeAlias!: string
}
