import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule } from "@/config/config.module.js"
import { DbModule } from "@/db/db.module.js"
import { TokensService } from "./tokens.service.js"
import { RefreshToken } from "./refresh-token.entity.js"

@Module({
  imports: [
    DbModule.forFeature([RefreshToken]),
    ConfigModule,
    JwtModule,
  ],
  providers: [
    TokensService,
  ],
  exports: [
    TokensService,
  ],
})
export class TokensModule { }
