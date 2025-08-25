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
    readonly db: {
      readonly lastUpdatedAt: number
    }
    readonly cache: {
      readonly lastUpdatedAt: number
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

  async signalDbUpdate(): Promise<void> {
    await this.cache.set(storeId, 'db', 'lastUpdatedAt', Date.now())
  }

  protected async refreshLikeCounts(): Promise<void> {
    const now = Date.now()
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
    await this.cache.set(storeId, 'cache', 'lastUpdatedAt', now)
  }

  /** @ignore */
  async onApplicationBootstrap(): Promise<void> {
    await this.refreshLikeCounts()
  }

  @Cron('* * * * *')
  protected async refreshLikeCountsIfNeeded(): Promise<void> {
    const [
      dbLastUpdatedAt,
      cacheLastUpdatedAt,
    ] = await Promise.all([
      this.cache.get(storeId, 'db', 'lastUpdatedAt'),
      this.cache.get(storeId, 'cache', 'lastUpdatedAt'),
    ])

    this.logger.debug({
      dbLastUpdatedAt,
      cacheLastUpdatedAt,
    })

    const needed = (
      dbLastUpdatedAt == null || // TODO: think about this
      cacheLastUpdatedAt == null ||
      cacheLastUpdatedAt < dbLastUpdatedAt
    )

    if (!needed) {
      this.logger.log('Update not needed')
    } else {
      await this.refreshLikeCounts()
    }
  }
}
