import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ServerError } from "@/app/app-error/app-error.js"
import { CacheService } from "@/cache/cache.service.js"
import { Like } from "./like.entity.js"

const storeId = 'tweetLikeCounts'

type Landscape = {
  readonly [storeId]: {
    readonly [tweetId: string]: {
      readonly count: number
    }
  }
}

export const enum AutoInitialize {
  Await = 'Await',
  Eventually = 'Eventually',
}

interface GetCountParams {
  readonly autoInitialize?: AutoInitialize | false
}

export interface Counts {
  readonly [tweetId: string]: number
}

@Injectable()
export class TweetLikeCountCacheService {
  constructor(
    @InjectRepository(Like)
    protected readonly likesRepository: Repository<Like>,
    protected readonly cache: CacheService<Landscape>,
  ) { }

  async setCount(tweetId: string, newCount: number): Promise<number> {
    await this.cache.set(storeId, tweetId, 'count', newCount)

    return newCount
  }

  async getCount(
    tweetId: string,
    {
      autoInitialize = AutoInitialize.Eventually,
    }: GetCountParams = {}): Promise<number> {
    const count = await this.cache.get(storeId, tweetId, 'count')

    if (count == null) {
      if (autoInitialize === AutoInitialize.Await) {
        await this.setCount(tweetId, 0)
      } else if (autoInitialize === AutoInitialize.Eventually) {
        /* no await */ this.setCount(tweetId, 0)
      }
    }

    return count ?? 0
  }

  async getCounts(tweetIds: string[]): Promise<Counts> {
    const countEntries = await Promise.all(tweetIds.map(async (id) => [
      id,
      await this.getCount(id),
    ] as const))

    const counts = Object.fromEntries(countEntries)

    return counts
  }

  async incrementCount(tweetId: string): Promise<number> {
    const count = await this.getCount(tweetId)

    return this.setCount(tweetId, count + 1)
  }

  async decrementCount(tweetId: string): Promise<number> {
    const count = await this.getCount(tweetId)

    if (count === 0) {
      throw new ZeroCountDecrementError(tweetId)
    }

    return this.setCount(tweetId, count - 1)
  }
}

export class ZeroCountDecrementError extends ServerError {
  public override readonly statusCode = '500'

  constructor(public readonly tweetId: string) {
    super(`Attempted to decrement likes count to tweet "${tweetId}", but it is already at 0`)
  }
}
