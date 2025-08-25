import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common"
import { AccessClaims } from "@/auth/access-claims.decorator.js"
import { PaginationParams } from "@/common/pagination-params.dto.js"
import { CreateTweetReqBody } from "./create-tweet-req-body.dto.js"
import { TimelineRow, TimelineService } from "./timeline.service.js"
import { Tweet } from "./tweet.entity.js"
import { TweetsService } from "./tweets.service.js"

@Controller('tweets')
export class TweetsController {
  constructor(
    protected readonly tweetsService: TweetsService,
    protected readonly timelineService: TimelineService,
  ) { }

  @Get()
  async getTimeline(
    @AccessClaims() claims: AccessClaims,
    @Query() paginationParams: PaginationParams,
  ): Promise<Api.HttpResponseBodyListPaginated<TimelineRow>> {
    const { items: timeline, pagination } = await this.timelineService.getTimeline({
      ...paginationParams,
      followerId: claims.userId,
    })

    return {
      result: timeline,
      pagination,
    }
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
}
