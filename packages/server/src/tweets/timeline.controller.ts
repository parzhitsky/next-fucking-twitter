import { Controller, Get, NotImplementedException } from "@nestjs/common"

@Controller('timeline')
export class TimelineController {
  // TODO: (query) limit + offset
  @Get()
  async getTimeline(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }
}
