import { AccessClaims } from "@/auth/access-claims.decorator.js"
import { Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common"
import { TweetsService } from "@/tweets/tweets.service.js"
import { HasTweetIdReqParams } from "./has-tweet-id-req-params.dto.js"
import { LikesService } from "./likes.service.js"
import { TweetLikeCountCacheService } from "./tweet-like-count-cache.service.js"

@Controller('likes')
export class LikesController {
  constructor(
    protected readonly tweetsService: TweetsService,
    protected readonly likesService: LikesService,
    protected readonly tweetLikeCountCacheService: TweetLikeCountCacheService,
  ) { }

  @Get(':tweetId')
  async getCount(
    @Param() { tweetId }: HasTweetIdReqParams,
  ): Promise<Api.HttpResponseBody<number>> {
    const tweet = await this.tweetsService.getById(tweetId)
    const likeCount = await this.tweetLikeCountCacheService.getCount(tweet.id)

    return {
      result: likeCount,
    }
  }

  @Post(':tweetId')
  @HttpCode(HttpStatus.ACCEPTED)
  async addLike(
    @AccessClaims() claims: AccessClaims,
    @Param() { tweetId }: HasTweetIdReqParams,
  ): Promise<Api.HttpResponseBody<number>> {
    const tweet = await this.tweetsService.getById(tweetId)
    const likeCount = await this.tweetLikeCountCacheService.getCount(tweet.id)

    await this.likesService.likeTweet(claims.userId, tweet.id)

    return {
      result: likeCount + 1,
    }
  }
}
