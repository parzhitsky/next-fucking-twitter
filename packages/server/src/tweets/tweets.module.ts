import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { Like } from "./like.entity.js"
import { LikeSubscriber } from "./like.subscriber.js"
import { LikesService } from "./likes.service.js"
import { TimelineService } from "./timeline.service.js"
import { TweetLikeCount } from "./tweet-like-count.entity.js"
import { Tweet } from "./tweet.entity.js"
import { TweetSubscriber } from "./tweet.subscriber.js"
import { TweetsController } from "./tweets.controller.js"
import { TweetsService } from "./tweets.service.js"

@Module({
  imports: [
    DbModule.forFeature([Tweet, Like, TweetLikeCount]),
  ],
  providers: [
    TweetsService,
    TimelineService,
    LikesService,
    TweetSubscriber,
    LikeSubscriber,
  ],
  controllers: [
    TweetsController,
  ],
})
export class TweetsModule { }
