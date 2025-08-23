import { Controller, NotImplementedException, Post, Redirect, Version } from "@nestjs/common"
import { Open } from "@/auth/open.decorator.js"

@Controller('users')
export class UsersController {
  @Open()
  @Post()
  @Version('1')
  @Redirect('/v1/auth/signup', 308)
  async createUserV1(): Promise<void> { }

  // TODO: (param) followee alias
  @Post(':followeeAlias/following')
  async followUser(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }
}
