import { Module } from "@nestjs/common"
import { TweetsController } from "./tweets.controller.js"
import { TweetsService } from "./tweets.service.js"

@Module({
  providers: [
    TweetsService,
  ],
  controllers: [
    TweetsController,
  ],
})
export class TweetsModule { }
