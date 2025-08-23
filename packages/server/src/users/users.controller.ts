import { Controller, HttpRedirectResponse, Param, Post, Redirect, Version } from "@nestjs/common"
import { Open } from "@/auth/open.decorator.js"
import { AccessClaims } from "@/auth/access-claims.decorator.js"
import { FollowUserReqParams } from "./follow-user-req-params.dto.js"
import { Following } from "./following.entity.js"
import { FollowingsService } from "./followings.service.js"
import { UsersService } from "./users.service.js"

@Controller('users')
export class UsersController {
  constructor(
    protected readonly usersService: UsersService,
    protected readonly followingsService: FollowingsService,
  ) { }

  @Open()
  @Post()
  @Version('1')
  @Redirect()
  async createUserV1(): Promise<HttpRedirectResponse> {
    return {
      url: '/v1/auth/signup?nosignin=1',
      statusCode: 308,
    }
  }

  @Post(':followeeAlias/followings')
  async followUser(
    @AccessClaims() claims: AccessClaims,
    @Param() { followeeAlias }: FollowUserReqParams,
  ): Promise<Api.HttpResponseBody<Following>> {
    const followee = await this.usersService.getByAlias(followeeAlias)
    const following = await this.followingsService.createFollowing(claims.userId, followee.id)

    return {
      result: following,
    }
  }
}
