import { Injectable } from "@nestjs/common"
import { JwtService, JwtSignOptions, NotBeforeError, TokenExpiredError } from "@nestjs/jwt"
import { ClientError } from "@/app/app-error/app-error.js"
import { ConfigService } from "@/config/config.service.js"

export const ACCESS_TOKEN_TTL = 60_000

interface TokenUserData {
  /** User ID */
  readonly sub: string
  readonly alias: string
}

export interface AccessTokenPayload extends TokenUserData { }

export interface RefreshTokenPayload extends TokenUserData {
  /** Token ID */
  readonly jti: string
}

interface TokenTypeToPayloadMap {
  readonly access: AccessTokenPayload
  readonly refresh: RefreshTokenPayload
}

type TokenType = keyof TokenTypeToPayloadMap

@Injectable()
export class JwtCodec {
  readonly #tokenSecret = this.config.get(this.config.keys.TOKEN_SECRET)

  private readonly withSecret = { secret: this.#tokenSecret } as const

  protected readonly accessTokenOptions: JwtSignOptions = {
    ...this.withSecret,
    expiresIn: ACCESS_TOKEN_TTL / 1000,
  }

  protected readonly refreshTokenOptions: JwtSignOptions = {
    ...this.withSecret,
    expiresIn: '5m', // TODO: set to 7 days
  }
  constructor(
    protected readonly config: ConfigService,
    protected readonly jwtService: JwtService,
  ) { }

  async encodeAccessToken(userId: string, userAlias: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, alias: userAlias }, this.accessTokenOptions)
  }

  async encodeRefreshToken(userId: string, userAlias: string, tokenId: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, alias: userAlias, jti: tokenId }, this.refreshTokenOptions)
  }

  async decodeToken<T extends TokenType>(tokenType: T, token: string): Promise<TokenTypeToPayloadMap[T]> {
    try {
      return await this.jwtService.verifyAsync(token, this.withSecret)
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenAlreadyExpiredError(tokenType, error.expiredAt)
      }

      if (error instanceof NotBeforeError) {
        throw new TokenNotYetActiveError(tokenType, error.date)
      }

      throw new UnknownTokenError(tokenType)
        .addDetailIf(error instanceof Error, () => ({
          public: true,
          message: (error as Error).message,
        }))
        .addDetailIf(typeof error === 'string', () => ({
          public: true,
          message: error as string,
        }))
    }
  }
}

function capitalizedTokenType(tokenType: TokenType): string {
  return tokenType[0].toUpperCase() + tokenType.slice(1)
}

export class TokenAlreadyExpiredError extends ClientError {
  public override readonly statusCode = '403'

  constructor(tokenType: TokenType, public readonly expiredAt: Date) {
    const capitalized = capitalizedTokenType(tokenType)

    super(`${capitalized} token had expired`)

    this.addDetail({
      public: true,
      message: `${capitalized} token had expired at ${expiredAt}`,
      payload: expiredAt,
    })
  }
}

export class TokenNotYetActiveError extends ClientError {
  public override readonly statusCode = '403'

  constructor(tokenType: TokenType, public readonly notBefore: Date) {
    const capitalized = capitalizedTokenType(tokenType)

    super(`${capitalized} token is not yet active`)

    this.addDetail({
      public: true,
      message: `${capitalized} token becomes active at ${notBefore}`,
      payload: notBefore,
    })
  }
}

export class UnknownTokenError extends ClientError {
  public override readonly statusCode = '403'

  constructor(tokenType: TokenType) {
    super(`Unknown ${tokenType} token error`)
  }
}
