import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule } from "@/config/config.module.js"
import { DbModule } from "@/db/db.module.js"
import { JwtCodec } from "./jwt-codec.service.js"
import { RefreshToken } from "./refresh-token.entity.js"
import { RefreshTokenRecordService } from "./refresh-token-record.service.js"
import { TokensService } from "./tokens.service.js"

@Module({
  imports: [
    DbModule.forFeature([RefreshToken]),
    ConfigModule,
    JwtModule,
  ],
  providers: [
    JwtCodec,
    RefreshTokenRecordService,
    TokensService,
  ],
  exports: [
    TokensService,
  ],
})
export class TokensModule { }
