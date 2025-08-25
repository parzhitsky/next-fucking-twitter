import { Injectable } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CacheService } from "@/cache/cache.service.js"
import { createLogger } from "@/common/create-logger.js"
import { Like } from "./like.entity.js"
import { TweetLikeCountCacheService } from "./tweet-like-count-cache.service.js"

const storeId = 'tweetLikeCountUpdateTrace'

type Landscape = {
  readonly [storeId]: {
    readonly dbLastUpdatedAt: {
      readonly value: number
    }
    readonly cacheLastUpdatedAt: {
      readonly value: number
    }
  }
}

interface TweetLikeCountEntryRaw {
  readonly tweet_id: string
  readonly like_count: number
}

@Injectable()
export class TweetLikeCountCacheRefresherService {
  protected readonly logger = createLogger(this.constructor.name)

  constructor(
    @InjectRepository(Like)
    protected readonly likesRepository: Repository<Like>,
    protected readonly cache: CacheService<Landscape>,
    protected readonly tweetLikeCountCacheService: TweetLikeCountCacheService,
  ) { }

  protected async refreshLikeCounts(): Promise<void> {
    const query = this.likesRepository
      .createQueryBuilder()
      .from(Like, 'like')
      .select('like.tweet_id', 'tweet_id')
      .addSelect('count(*)', 'like_count')
      .groupBy('like.tweet_id')

    const entries = await query.getRawMany<TweetLikeCountEntryRaw>()
    const countsSet = entries.map(async ({ tweet_id, like_count }) => {
      await this.tweetLikeCountCacheService.setCount(tweet_id, like_count)
    })

    await Promise.all(countsSet)
  }

  @Cron('* * * * *')
  protected async refreshLikeCountsIfNeeded(): Promise<void> {
    const [
      dbLastUpdatedAt,
      cacheLastUpdatedAt,
    ] = await Promise.all([
      this.cache.get(storeId, 'dbLastUpdatedAt', 'value'),
      this.cache.get(storeId, 'cacheLastUpdatedAt', 'value'),
    ])

    const needed = (
      dbLastUpdatedAt == null || // TODO: think about this
      cacheLastUpdatedAt == null ||
      cacheLastUpdatedAt < dbLastUpdatedAt
    )

    if (!needed) {
      this.logger.log(`Update not needed; last cache update was at ${new Date(cacheLastUpdatedAt)}`)

      return
    }

    const now = Date.now()

    await this.refreshLikeCounts()
    await this.cache.set(storeId, 'cacheLastUpdatedAt', 'value', now)
  }

  /** @ignore */
  async onApplicationBootstrap(): Promise<void> {
    await this.refreshLikeCounts()
  }
}
