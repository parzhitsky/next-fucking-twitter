import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
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

  async getLikesCount(tweetId: string): Promise<number> {
    const record = await this.tweetLikeCountRepo.findOneBy({ tweetId })

    if (!record) {
      this.logger.warn(`Attempted to get like count of a tweet "${tweetId}", but the record is not found; falling back to 0`)

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

    return this.likesRepository.save(like)

    // TODO: check whether tweet_like_count is updated automatically
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
