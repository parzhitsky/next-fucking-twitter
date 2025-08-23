import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { TweetsController } from "./tweets.controller.js"
import { Tweet } from "./tweet.entity.js"
import { TweetsService } from "./tweets.service.js"
import { TimelineService } from "./timeline.service.js"

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
})
export class TweetsModule { }
