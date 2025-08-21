import { type MiddlewareConsumer, Module, type NestModule, type DynamicModule } from '@nestjs/common'
import { AuthModule } from '@/auth/auth.module.js'
import { ConfigModule } from '@/config/config.module.js'
import { DbModule } from '@/db/db.module.js'
import { HealthModule } from '@/health/health.module.js'
import { TweetsModule } from '@/tweets/tweets.module.js'
import { AppErrorFilter } from './app-error/app-error.filter.js'
import { DevModule } from './dev/dev.module.js'
import { HttpLoggerMiddleware } from './http-logger.middleware.js'
import { HttpRateLimiterMiddleware } from './http-rate-limiter.middleware.js'

/** @private */
interface RegisterParams {
  readonly importDevModule: boolean
}

@Module({
  imports: [
    ConfigModule,
    DbModule,
    AuthModule,
    HealthModule,
    TweetsModule,
  ],
  providers: [
    AppErrorFilter,
  ],
})
export class AppModule implements NestModule {
  static register({ importDevModule }: RegisterParams): DynamicModule {
    return {
      module: AppModule,
      imports: importDevModule ? [DevModule] : [],
    }
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(HttpLoggerMiddleware, HttpRateLimiterMiddleware)
      .forRoutes('*')
  }
}
