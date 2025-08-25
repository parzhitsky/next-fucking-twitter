import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ClientError } from "@/app/app-error/app-error.js"
import { Like } from "./like.entity.js"
import { TweetLikeCountCacheService } from "./tweet-like-count-cache.service.js"
import { TweetLikeCountCacheRefresherService } from "./tweet-like-count-cache-refresher.service.js"

interface LikeBare {
  readonly userId: string
  readonly tweetId: string
}

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    protected readonly likesRepository: Repository<Like>,
    protected readonly tweetLikeCountCacheService: TweetLikeCountCacheService,
    protected readonly tweetLikeCountCacheRefresherService: TweetLikeCountCacheRefresherService,
  ) { }

  protected async addLikeRecord(props: LikeBare): Promise<Like> {
    const like = this.likesRepository.create(props)

    await this.likesRepository.save(like)

    /* no await */ Promise.all([
      this.tweetLikeCountCacheService.incrementCount(props.tweetId),
      this.tweetLikeCountCacheRefresherService.signalDbUpdate(),
    ])

    return like
  }

  async likeTweet(userId: string, tweetId: string): Promise<Like> {
    const props: LikeBare = { userId, tweetId }
    const existing = await this.likesRepository.findOneBy(props)

    if (existing != null) {
      throw new TweetAlreadyLikedError(userId, tweetId)
    }

    return this.addLikeRecord(props)
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
      message: `User "${userId}" attempted to like tweet "${tweetId}" again`,
      payload: {
        userId,
        tweetId,
      },
    })
  }
}
