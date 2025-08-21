import { Module } from "@nestjs/common"
import { TweetsController } from "./tweets.controller.js"

@Module({
  controllers: [
    TweetsController,
  ],
})
export class TweetsModule { }
