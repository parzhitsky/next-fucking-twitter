import { Injectable } from "@nestjs/common"
import { JwtService, JwtSignOptions, NotBeforeError, TokenExpiredError } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ServerError, ClientError } from "@/app/app-error/app-error.js"
import { ConfigService } from "@/config/config.service.js"
import { RefreshToken } from "./refresh-token.entity.js"

// FIXME: This file is to long. Consider breaking this service into 2–3 smaller services

export const ACCESS_TOKEN_TTL = 10_000 // TODO: set to 1 minute

export interface TokenUserData {
  /** User ID */
  readonly sub: string
  readonly alias: string
}

export interface AccessTokenPayload extends TokenUserData { }

export interface RefreshTokenPayload extends TokenUserData {
  /** Token ID */
  readonly jti: string
}

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

interface TokenTypeToPayloadMap {
  readonly access: AccessTokenPayload
  readonly refresh: RefreshTokenPayload
}

type TokenType = keyof TokenTypeToPayloadMap

@Injectable()
export class TokensService {
  readonly #tokenSecret = this.config.get(this.config.keys.TOKEN_SECRET)

  private readonly withSecret = { secret: this.#tokenSecret } as const

  protected readonly accessTokenOptions: JwtSignOptions = {
    ...this.withSecret,
    expiresIn: ACCESS_TOKEN_TTL / 1000,
  }

  protected readonly refreshTokenOptions: JwtSignOptions = {
    ...this.withSecret,
    expiresIn: '1m', // TODO: set to 7 days
  }

  constructor(
    protected readonly config: ConfigService,
    protected readonly jwtService: JwtService,

    @InjectRepository(RefreshToken)
    protected readonly refreshTokenRepo: Repository<RefreshToken>,
  ) { }

  protected async generateAccessToken(sub: string, alias: string): Promise<string> {
    return this.jwtService.signAsync({ sub, alias }, this.accessTokenOptions)
  }

  protected async createRefreshTokenRecord(): Promise<RefreshToken> {
    const record = this.refreshTokenRepo.create()

    return this.refreshTokenRepo.save(record)
  }

  protected async generateRefreshToken(sub: string, alias: string): Promise<string> {
    const record = await this.createRefreshTokenRecord()
    const payload: RefreshTokenPayload = { sub, alias, jti: record.id }

    return this.jwtService.signAsync(payload, this.refreshTokenOptions)
  }

  async generatePair({ sub, alias }: TokenUserData): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(sub, alias),
      this.generateRefreshToken(sub, alias),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  async verifyToken<T extends TokenType>(tokenType: T, token: string): Promise<TokenTypeToPayloadMap[T]> {
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
    }
  }

  protected async findRefreshTokenRecordByJti(jti: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepo.findOneBy({ id: jti })
  }

  protected getRefreshTokenIsUsed(record: RefreshToken): boolean {
    if (record.usedAt == null) {
      return false
    }

    if (record.usedAt.getTime() >= Date.now()) {
      throw new RefreshTokenUsedInFutureError(record.id)
    }

    return true
  }

  async refreshPair(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyToken('refresh', refreshToken)
    const record = await this.findRefreshTokenRecordByJti(payload.jti)

    if (record == null) {
      throw new RefreshTokenNotFoundError(payload.jti)
    }

    const isUsed = this.getRefreshTokenIsUsed(record)

    if (isUsed) {
      throw new RefreshTokenAlreadyUsedError(payload.jti)
    }

    record.usedAt = new Date()

    await this.refreshTokenRepo.save(record)

    const tokenPair = await this.generatePair(payload)

    return tokenPair
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

interface RefreshTokenError extends Error {
  readonly jti: string
}

export class RefreshTokenNotFoundError extends ServerError implements RefreshTokenError {
  public override readonly statusCode = '500'

  constructor(public readonly jti: string) {
    super(`Refresh token "${jti}" was not found in the DB`)

    this.addDetail({
      public: false,
      message: `Record "${jti}" is expected to exist in the refresh token table, but was not found`,
      payload: jti,
    })
  }
}

export class RefreshTokenUsedInFutureError extends ServerError implements RefreshTokenError {
  public override readonly statusCode = '500'

  constructor(public readonly jti: string) {
    super(`Refresh token "${jti}" is marked to will have been used in the future`)

    this.addDetail({
      public: false,
      message: "Refresh token being used in the future does not make sense, this needs debugging",
      payload: jti,
    })
  }
}

export class RefreshTokenAlreadyUsedError extends ClientError implements RefreshTokenError {
  public override readonly statusCode = '403'

  constructor(public readonly jti: string) {
    super(`Refresh token "${jti}" is already used, cannot use it more than once`)
  }
}
