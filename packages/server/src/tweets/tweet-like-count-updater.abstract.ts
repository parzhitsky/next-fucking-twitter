import { EntitySubscriberInterface, DataSource, InsertEvent, RemoveEvent } from "typeorm"

export abstract class TweetLikeCountUpdater<Entity extends object> implements EntitySubscriberInterface<Entity> {
  abstract listenTo(): { new(): Entity }

  protected async refreshTweetLikeCount(dataSource: DataSource): Promise<void> {
    await dataSource.query(`refresh materialized view concurrently tweet_like_count;`) // TODO: Log errors without crashing
  }

  async afterInsert(event: InsertEvent<Entity>): Promise<void> {
    await this.refreshTweetLikeCount(event.manager.connection)
  }

  async afterRemove(event: RemoveEvent<Entity>): Promise<void> {
    await this.refreshTweetLikeCount(event.manager.connection)
  }
}
