import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { TweetsModule } from "@/tweets/tweets.module.js" // FIXME: I'm not sure about that
import { Like } from "./like.entity.js"
import { LikesController } from "./likes.controller.js"
import { LikesService } from "./likes.service.js"
import { TweetLikeCountCacheService } from "./tweet-like-count-cache.service.js"
import { TweetLikeCountCacheRefresherService } from "./tweet-like-count-cache-refresher.service.js"

@Module({
  imports: [
    DbModule.forFeature([Like]),
    TweetsModule,
  ],
  providers: [
    LikesService,
    TweetLikeCountCacheService,
    TweetLikeCountCacheRefresherService,
  ],
  controllers: [
    LikesController,
  ],
})
export class LikesModule { }
