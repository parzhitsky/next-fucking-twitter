import { EventSubscriber } from "typeorm"
import { TweetLikeCountUpdater } from "./tweet-like-count-updater.abstract.js"
import { Tweet } from "./tweet.entity.js"

@EventSubscriber()
export class TweetSubscriber extends TweetLikeCountUpdater<Tweet> {
  override listenTo() {
    return Tweet
  }
}
