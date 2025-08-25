import { IsUUID } from "class-validator"

export class HasTweetIdReqParams {
  @IsUUID('4')
  readonly tweetId!: string
}
