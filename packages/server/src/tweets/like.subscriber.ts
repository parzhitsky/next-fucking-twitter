import { EventSubscriber } from "typeorm"
import { Like } from "./like.entity.js"
import { TweetLikeCountUpdater } from "./tweet-like-count-updater.abstract.js"

@EventSubscriber()
export class LikeSubscriber extends TweetLikeCountUpdater<Like> {
  override listenTo() {
    return Like
  }
}
