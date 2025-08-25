import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { TimelineService } from "./timeline.service.js"
import { Tweet } from "./tweet.entity.js"
import { TweetsController } from "./tweets.controller.js"
import { TweetsService } from "./tweets.service.js"

@Module({
  imports: [
    DbModule.forFeature([Tweet]),
  ],
  providers: [
    TweetsService,
    TimelineService,
  ],
  controllers: [
    TweetsController,
  ],
  exports: [
    TweetsService,
  ],
})
export class TweetsModule { }
