import { Body, Controller, Post, Redirect, Res, Version } from "@nestjs/common"
import { CookieOptions, Response } from 'express'
import { ConfigService } from "@/config/config.service.js"
import { ACCESS_TOKEN_TTL, TokenPair, TokensService } from "./tokens/tokens.service.js"
import { AuthService } from "./auth.service.js"
import { HasRefreshToken } from "./has-refresh-token.dto.js"
import { Open } from "./open.decorator.js"
import { UserCreds } from "./user-creds.dto.js"

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
    protected readonly tokensService: TokensService,
  ) { }

  @Post('signup')
  @Version('1')
  @Redirect('/v1/auth/signin', 308)
  async signUpV1(
    @Body() creds: UserCreds,
  ): Promise<void> {
    await this.authService.signUp(creds)
  }

  protected tokenPairApplied(res: Response, { accessToken, refreshToken }: TokenPair): Api.HttpResponseBody<HasRefreshToken> {
    res.cookie('access_token', accessToken, this.accessTokenCookieOptions)

    return {
      result: {
        refreshToken,
      },
    }
  }

  @Post('signin')
  @Version('1')
  async signInV1(
    @Body() creds: UserCreds,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Api.HttpResponseBody<HasRefreshToken>> {
    const tokenPair = await this.authService.signIn(creds)

    return this.tokenPairApplied(res, tokenPair)
  }

  @Post('refresh')
  async refresh(
    @Body() body: HasRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Api.HttpResponseBody<HasRefreshToken>> {
    const tokenPair = await this.tokensService.refreshPair(body.refreshToken)

    return this.tokenPairApplied(res, tokenPair)
  }

  @Post('revoke')
  async revokeAuth(
    @Body() body: HasRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Api.HttpResponseBody<null>> {
    res.clearCookie('access_token', this.accessTokenCookieOptions)

    await this.tokensService.revokeRefreshToken(body.refreshToken)

    return {
      result: null,
    }
  }
}
