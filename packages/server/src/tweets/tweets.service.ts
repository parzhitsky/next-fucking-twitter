import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ClientError } from "@/app/app-error/app-error.js"
import { Tweet } from "./tweet.entity.js"

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    protected readonly tweetRepository: Repository<Tweet>,
  ) { }

  async getById(id: string): Promise<Tweet> {
    const tweet = await this.tweetRepository.findOneBy({ id })

    if (!tweet) {
      throw new TweetNotFoundById(id)
    }

    return tweet
  }

  async createTweet(userId: string, text: string): Promise<Tweet> {
    const tweet = this.tweetRepository.create({
      createdById: userId,
      text,
    })

    return this.tweetRepository.save(tweet)
  }
}

export class TweetNotFoundById extends ClientError {
  public override readonly statusCode = '404'

  constructor(public readonly tweetId: string) {
    super(`Tweet "${tweetId}" was not found`)
  }
}
