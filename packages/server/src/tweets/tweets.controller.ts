import { Controller, HttpCode, HttpStatus, NotImplementedException, Post } from "@nestjs/common"

@Controller('tweets')
export class TweetsController {
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
