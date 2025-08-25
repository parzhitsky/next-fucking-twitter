import { Global, Module } from "@nestjs/common"
import { CacheModuleOptions, CacheModule as NestCacheModule } from "@nestjs/cache-manager"
import KeyvRedis from "@keyv/redis"
import { ConfigService } from "@/config/config.service.js"
import { CacheService } from "./cache.service.js"

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): CacheModuleOptions => ({
        stores: [
          new KeyvRedis(config.get(config.keys.CACHE_URL)),
        ],
      }),
    }),
  ],
  providers: [
    CacheService,
  ],
  exports: [
    NestCacheModule,
    CacheService,
  ],
})
export class CacheModule { }
