import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Cron } from "@nestjs/schedule"
import { Repository } from "typeorm"
import { ClientError } from "@/app/app-error/app-error.js"
import { createLogger } from "@/common/create-logger.js"
import { Like } from "./like.entity.js"
import { TweetLikeCount } from "./tweet-like-count.entity.js"

@Injectable()
export class LikesService {
  protected readonly logger = createLogger(this.constructor.name)

  constructor(
    @InjectRepository(Like)
    protected readonly likesRepository: Repository<Like>,

    @InjectRepository(TweetLikeCount)
    protected readonly tweetLikeCountRepo: Repository<TweetLikeCount>,
  ) { }

  /** @deprecated Use cache + cron job */
  @Cron('* * * * *')
  async refreshLikeCounts(): Promise<void> {
    await this.tweetLikeCountRepo.query(`REFRESH MATERIALIZED VIEW ${this.tweetLikeCountRepo.metadata.tableNameWithoutPrefix};`)
  }

  async getLikesCount(tweetId: string): Promise<number> {
    const record = await this.tweetLikeCountRepo.findOneBy({ tweetId })

    if (!record) {
      this.logger.warn(`No like count record found for tweet "${tweetId}"; falling back to 0 likes`)

      return 0
    }

    return record.likeCount
  }

  async likeTweet(userId: string, tweetId: string): Promise<Like> {
    const props = { userId, tweetId } as const
    const existing = await this.likesRepository.findOneBy(props)

    if (existing != null) {
      throw new TweetAlreadyLikedError(userId, tweetId)
    }

    const like = this.likesRepository.create(props)

    await this.likesRepository.save(like)
    await this.refreshLikeCounts()

    return like
  }
}

export class TweetAlreadyLikedError extends ClientError {
  public override readonly statusCode = '409'

  constructor(
    public readonly userId: string,
    public readonly tweetId: string,
  ) {
    super('The like already exists')

    this.addDetail({
      public: true,
      message: `User "${userId}" attempted to like tweet "${tweetId}"`,
      payload: {
        userId,
        tweetId,
      },
    })
  }
}
