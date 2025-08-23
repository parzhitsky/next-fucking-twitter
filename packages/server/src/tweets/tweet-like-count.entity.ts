import { ViewColumn, ViewEntity } from "typeorm"
import { Like } from "./like.entity.js"

/** @deprecated Use cache + cron job */
@ViewEntity({
  materialized: true,
  name: 'tweet_like_count',
  expression: (dataSource) => (
    dataSource
      .createQueryBuilder()
      .from(Like, 'like')
      .select('like.tweet_id', 'tweet_id')
      .addSelect('count(*)', 'like_count')
      .groupBy('tweet_id')
  ),
})
export class TweetLikeCount {
  @ViewColumn({
    name: 'tweet_id',
  })
  readonly tweetId!: string

  @ViewColumn({
    name: 'like_count',
  })
  readonly likeCount!: number
}
