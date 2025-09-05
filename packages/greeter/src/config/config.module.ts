import { Module } from "@nestjs/common"
import { ConfigModule as SharedConfigModule } from "@@shared/config/config.module.js"
import { ConfigDTO } from "./config.dto.js"

@Module({
  imports: [
    SharedConfigModule.forRoot(ConfigDTO, {
      envFileUrl: new URL('../../.env.local', import.meta.url),
    }),
  ],
})
export class ConfigModule { }
