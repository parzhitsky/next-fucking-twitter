import { Body, Controller, Post, Redirect, Res, Version } from "@nestjs/common"
import { CookieOptions, Response } from 'express'
import { ConfigService } from "@/config/config.service.js"
import { ACCESS_TOKEN_TTL } from "./tokens/tokens.service.js"
import { AuthService } from "./auth.service.js"
import { Open } from "./open.decorator.js"
import { UserCreds } from "./user-creds.dto.js"

export interface SignInResBody {
  readonly refreshToken: string
}

@Open()
@Controller('auth')
export class AuthController {
  protected readonly accessTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_TTL,
    secure: !this.config.isDevelopment(),
  }

  constructor(
    protected readonly config: ConfigService,
    protected readonly authService: AuthService,
  ) { }

  @Post('signup')
  @Version('1')
  @Redirect('/v1/auth/signin', 308)
  async signUpV1(
    @Body() creds: UserCreds,
  ): Promise<void> {
    await this.authService.signUp(creds)
  }

  @Post('signin')
  @Version('1')
  async signInV1(
    @Body() creds: UserCreds,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Api.HttpResponseBody<SignInResBody>> {
    const { accessToken, refreshToken } = await this.authService.signIn(creds)

    res.cookie('access_token', accessToken, this.accessTokenCookieOptions)

    return {
      result: {
        refreshToken,
      },
    }
  }
}
