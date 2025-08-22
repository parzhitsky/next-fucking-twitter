import { Body, Controller, HttpCode, HttpStatus, NotImplementedException, Post, Res } from "@nestjs/common"
import { CookieOptions, Response } from 'express'
import { Result } from "@@libs/@eco/utils/result/result.type.js"
import { ConfigService } from "@/config/config.service.js"
import { AuthService } from "./auth.service.js"
import { ACCESS_TOKEN_TTL } from "./tokens/tokens.service.js"
import { UserCreds } from "./user-creds.dto.js"

export interface SignInResBody {
  readonly refreshToken: string
}

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

  // TODO: (body) userAlias + password
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }

  @Post('signin')
  async signIn(
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
