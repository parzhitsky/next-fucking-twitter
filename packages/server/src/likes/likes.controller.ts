import { AccessClaims } from "@/auth/access-claims.decorator.js"
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common"
import { TweetsService } from "@/tweets/tweets.service.js"
import { GetCountsReqBody } from "./get-counts-req-body.dto.js"
import { HasTweetIdReqParams } from "./has-tweet-id-req-params.dto.js"
import { LikesService } from "./likes.service.js"
import { Counts, TweetLikeCountCacheService } from "./tweet-like-count-cache.service.js"

@Controller('likes')
export class LikesController {
  constructor(
    protected readonly tweetsService: TweetsService,
    protected readonly likesService: LikesService,
    protected readonly tweetLikeCountCacheService: TweetLikeCountCacheService,
  ) { }

  @Get()
  async getCounts(
    @Body() { tweetIds }: GetCountsReqBody,
  ): Promise<Api.HttpResponseBody<Counts>> {
    const counts = await this.tweetLikeCountCacheService.getCounts(tweetIds)

    return {
      result: counts,
    }
  }

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
