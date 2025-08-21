import { Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post } from "@nestjs/common"

@Controller('tweets')
export class TweetsController {
  // TODO: (query) limit + offset
  @Get()
  async getTweets(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }

  // TODO: (body) text
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTweet(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }

  // TODO: (param) tweet id
  @Post(':id/like')
  @HttpCode(HttpStatus.ACCEPTED)
  async likeTweet(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }
}
