import { Module } from '@nestjs/common'
import { UsersModule } from '@/users/users.module.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { TokensModule } from './tokens/tokens.module.js'

@Module({
  imports: [
    TokensModule,
    UsersModule,
  ],
  providers: [
    AuthService,
  ],
  controllers: [
    AuthController,
  ],
  exports: [
    AuthService,
  ],
})
export class AuthModule { }
