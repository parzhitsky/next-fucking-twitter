import { Module } from "@nestjs/common"
import { TweetsController } from "./tweets.controller.js"
import { TimelineController } from "./timeline.controller.js"

@Module({
  controllers: [
    TweetsController,
    TimelineController,
  ],
})
export class TweetsModule { }
