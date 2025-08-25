import { ArrayMaxSize, ArrayNotEmpty, IsUUID } from "class-validator"
import { TIMELINE_LIMIT_DEFAULT } from "@/tweets/timeline.service.js"

export const TWEET_IDS_COUNT_MAX = 2 * TIMELINE_LIMIT_DEFAULT

export class GetCountsReqBody {
  @ArrayNotEmpty()
  @ArrayMaxSize(TWEET_IDS_COUNT_MAX)
  @IsUUID('4', { each: true })
  readonly tweetIds!: string[]
}
