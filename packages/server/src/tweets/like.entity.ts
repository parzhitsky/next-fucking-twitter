import { Column, Entity, EventSubscriber, JoinColumn, ManyToOne } from "typeorm"
import { User } from "@/users/user.entity.js"
import { Tweet } from "./tweet.entity.js"
import { TweetLikeCountUpdater } from "./tweet-like-count-updater.abstract.js"

@Entity('like')
export class Like {
  @Column({
    name: 'user_id',
    type: 'uuid',
    primary: true,
  })
  readonly userId!: string

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  readonly user!: User

  @Column({
    name: 'tweet_id',
    type: 'uuid',
    primary: true,
  })
  readonly tweetId!: string

  @ManyToOne(() => Tweet)
  @JoinColumn({
    name: 'tweet_id',
    referencedColumnName: 'id',
  })
  readonly tweet!: Tweet

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  readonly createdAt!: Date
}

@EventSubscriber()
export class LikeSubscriber extends TweetLikeCountUpdater<Like> {
  override listenTo() {
    return Like
  }
}
