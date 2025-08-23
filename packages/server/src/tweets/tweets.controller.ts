import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post } from "@nestjs/common"
import { AccessClaims } from "@/auth/access-claims.decorator.js"
import { CreateTweetReqBody } from "./create-tweet-req-body.dto.js"
import { TweetsService } from "./tweets.service.js"
import { Tweet } from "./tweet.entity.js"

@Controller('tweets')
export class TweetsController {
  constructor(
    protected readonly tweetsService: TweetsService,
  ) { }

  // TODO: (query) limit + offset
  @Get()
  async getTweets(): Promise<Api.HttpResponseBodyListPaginated<never>> {
    throw new NotImplementedException()
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTweet(
    @AccessClaims() claims: AccessClaims,
    @Body() body: CreateTweetReqBody,
  ): Promise<Api.HttpResponseBody<Tweet>> {
    const tweet = await this.tweetsService.createTweet(claims.userId, body.text)

    return {
      result: tweet,
    }
  }

  // TODO: (param) tweet id
  @Post(':tweetId/likes')
  @HttpCode(HttpStatus.ACCEPTED)
  async likeTweet(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }
}
