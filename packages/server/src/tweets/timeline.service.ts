import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ListPaginated } from "@@libs/@eco/utils/pagination/list-paginated.type.js"
import { PaginationParams } from "@/common/pagination-params.dto.js"
import { Following } from "@/users/following.entity.js"
import { Tweet } from "./tweet.entity.js"

export const TIMELINE_LIMIT_DEFAULT = 10

export const TIMELINE_OFFSET_DEFAULT = 0

export interface GetTimelineParams extends PaginationParams {
  readonly followerId: string
}

export interface TimelineRow {
  readonly sequence_number: number
  readonly tweet_id: string
  readonly author_id: string
  readonly author_alias: string
  readonly tweet_created_at: string
  readonly tweet_text: string
}

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Tweet)
    protected readonly tweetRepository: Repository<Tweet>,
  ) { }

  async getTimeline({
    followerId,
    limit = TIMELINE_LIMIT_DEFAULT,
    offset = TIMELINE_OFFSET_DEFAULT,
  }: GetTimelineParams): Promise<ListPaginated<TimelineRow>> {
    const query = this.tweetRepository
      .createQueryBuilder('tweet')
      .innerJoin('tweet.createdBy', 'author')
      .innerJoin(Following, 'f', 'f.followee_id = author.id')
      .where('f.follower_id = :followerId', { followerId })
      .select([
        'row_number() over (order by tweet.created_at desc) as sequence_number',
        'tweet.id as tweet_id',
        'author.id as author_id',
        'author.alias as author_alias',
        'tweet.created_at as tweet_created_at',
        'tweet.text as tweet_text',
      ])
      .orderBy('tweet.created_at', 'DESC')
      .limit(limit)
      .offset(offset)

    const [timeline, totalCount] = await Promise.all([
      query.getRawMany<TimelineRow>(),
      query.getCount(),
    ])

    return {
      items: timeline,
      pagination: {
        limit,
        offset,
        totalCount,
      },
    }
  }
}
