import { Controller, NotImplementedException, Post, Redirect, Version } from "@nestjs/common"

@Controller('users')
export class UsersController {
  @Post()
  @Version('1')
  @Redirect('/v1/auth/signup', 308)
  async createUserV1(): Promise<void> {}

  // TODO: (param) user id
  @Post(':followeeId/following')
  async followUser(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }
}
