import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ClientError } from "@/app/app-error/app-error.js"
import { Following } from "./following.entity.js"
import { UsersService } from "./users.service.js"

@Injectable()
export class FollowingsService {
  constructor(
    protected readonly usersService: UsersService,

    @InjectRepository(Following)
    protected readonly followingsRepo: Repository<Following>,
  ) { }

  async createFollowing(followerId: string, followeeId: string): Promise<Following> {
    if (followerId === followeeId) {
      throw new UserCannotFollowSelfError(followerId)
    }

    const props = { followeeId, followerId } as const
    const existing = await this.followingsRepo.findOneBy(props)

    if (existing != null) {
      throw new FollowingAlreadyCreatedError(followeeId, followerId)
    }

    const following = this.followingsRepo.create(props)

    return this.followingsRepo.save(following)
  }
}

export class UserCannotFollowSelfError extends ClientError {
  public override readonly statusCode = '409'

  constructor(public readonly userId: string) {
    super('Users cannot follow themselves')

    this.addDetail({
      public: true,
      message: `User "${userId}" attempted to follow themselves`,
      payload: userId,
    })
  }
}

export class FollowingAlreadyCreatedError extends ClientError {
  public override readonly statusCode = '409'

  constructor(
    public readonly followerId: string,
    public readonly followeeId: string,
  ) {
    super(`User "${followerId}" already follows user "${followeeId}"`)

    this.addDetail({
      public: true,
      message: `User "${followerId}" attempted to follow user "${followeeId}"`,
      payload: {
        followerId,
        followeeId,
      },
    })
  }
}
