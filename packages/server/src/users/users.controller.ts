import { Controller, NotImplementedException, Post } from "@nestjs/common"

@Controller('users')
export class UsersController {
  // TODO: (param) user id
  @Post(':id/follow')
  async followUser(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }
}
