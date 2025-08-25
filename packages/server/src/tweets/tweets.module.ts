import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { Like } from "./like.entity.js"
import { LikesService } from "./likes.service.js"
import { TimelineService } from "./timeline.service.js"
import { TweetLikeCountCacheService } from "./tweet-like-count-cache.service.js"
import { Tweet } from "./tweet.entity.js"
import { TweetsController } from "./tweets.controller.js"
import { TweetsService } from "./tweets.service.js"

@Module({
  imports: [
    DbModule.forFeature([Tweet, Like]),
  ],
  providers: [
    TweetsService,
    TimelineService,
    LikesService,
    TweetLikeCountCacheService,
  ],
  controllers: [
    TweetsController,
  ],
})
export class TweetsModule { }
