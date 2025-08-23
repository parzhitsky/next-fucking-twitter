import { IsUUID } from "class-validator"

export class LikeTweetReqParams {
  @IsUUID('4')
  readonly tweetId!: string
}
