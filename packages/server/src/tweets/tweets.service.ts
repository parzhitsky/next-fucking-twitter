import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Tweet } from "./tweet.entity.js"

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    protected readonly tweetRepository: Repository<Tweet>,
  ) { }

  async createTweet(userId: string, text: string): Promise<Tweet> {
    const tweet = this.tweetRepository.create({
      createdById: userId,
      text,
    })

    return this.tweetRepository.save(tweet)
  }
}
