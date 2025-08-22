import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { UsersModule } from '@/users/users.module.js'
import { AuthController } from './auth.controller.js'
import { AuthGuard } from './auth.guard.js'
import { AuthService } from './auth.service.js'
import { TokensModule } from './tokens/tokens.module.js'

@Module({
  imports: [
    TokensModule,
    UsersModule,
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [
    AuthController,
  ],
  exports: [
    AuthService,
  ],
})
export class AuthModule { }
