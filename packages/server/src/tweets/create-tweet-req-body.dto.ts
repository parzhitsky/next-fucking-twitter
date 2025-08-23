import { IsNotEmpty, IsString, MaxLength } from "class-validator"
import { TEXT_MAX_LENGTH } from "./tweet.entity.js"

export class CreateTweetReqBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_MAX_LENGTH)
  readonly text!: string
}
