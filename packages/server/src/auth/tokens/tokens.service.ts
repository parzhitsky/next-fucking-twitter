import { Injectable } from "@nestjs/common"
import { JwtService, JwtSignOptions, NotBeforeError, TokenExpiredError } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ServerError, ClientError } from "@/app/app-error/app-error.js"
import { ConfigService } from "@/config/config.service.js"
import { RefreshToken } from "./refresh-token.entity.js"

// FIXME: This file is to long. Consider breaking this service into 2–3 smaller services

export const ACCESS_TOKEN_TTL = 10_000 // TODO: set to 1 minute

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

type GeneratePairInput = Partial<RefreshTokenPayload> & Required<TokenUserData>

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

  protected async createRefreshTokenRecord(oldJti?: string): Promise<RefreshToken> {
    const record = this.refreshTokenRepo.create({
      generatedFromId: oldJti ?? null,
    })

    return this.refreshTokenRepo.save(record)
  }

  protected async generateRefreshToken(sub: string, alias: string, oldJti?: string): Promise<string> {
    const record = await this.createRefreshTokenRecord(oldJti)
    const payload: RefreshTokenPayload = { sub, alias, jti: record.id }

    return this.jwtService.signAsync(payload, this.refreshTokenOptions)
  }

  async generatePair({ sub, alias, jti }: GeneratePairInput): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(sub, alias),
      this.generateRefreshToken(sub, alias, jti),
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

  protected getRefreshTokenIsRevoked(record: RefreshToken): boolean {
    if (record.revokedAt == null) {
      return false
    }

    if (record.revokedAt.getTime() >= Date.now()) {
      throw new RefreshTokenRevokedInFutureError(record.id)
    }

    return true
  }

  protected async verifyRefreshToken(token: string): Promise<[RefreshTokenPayload, RefreshToken | null]> {
    const payload = await this.verifyToken('refresh', token)
    const record = await this.findRefreshTokenRecordByJti(payload.jti)

    return [payload, record]
  }

  protected async markRefreshTokenAsRevoked(record: RefreshToken): Promise<void> {
    record.revokedAt = new Date()

    await this.refreshTokenRepo.save(record)
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const [payload, record] = await this.verifyRefreshToken(token)

    if (record == null) {
      throw new RefreshTokenNotFoundError(payload.jti)
    }

    await this.markRefreshTokenAsRevoked(record)
  }

  async refreshPair(refreshToken: string): Promise<TokenPair> {
    const [payload, record] = await this.verifyRefreshToken(refreshToken)

    if (record == null) {
      throw new RefreshTokenNotFoundError(payload.jti)
    }

    const isRevoked = this.getRefreshTokenIsRevoked(record)

    if (isRevoked) {
      throw new RefreshTokenRevokedError(record.id)
        .addDetail({
          public: true,
          message: `Refresh token was revoked at ${record.revokedAt}`,
          payload: record.revokedAt!,
        })
    }

    await this.markRefreshTokenAsRevoked(record)

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

export class RefreshTokenRevokedInFutureError extends ServerError implements RefreshTokenError {
  protected static readonly detailMessage = "Refresh token being revoked in the future does not make sense in the context of the current implementation"

  public override readonly statusCode = '500'

  constructor(public readonly jti: string) {
    super(`Refresh token "${jti}" is marked to will have been revoked in the future`)

    this.addDetail({
      public: false,
      message: new.target.detailMessage,
      payload: jti,
    })
  }
}

export class RefreshTokenRevokedError extends ClientError implements RefreshTokenError {
  public override readonly statusCode = '403'

  constructor(public readonly jti: string) {
    super(`Refresh token "${jti}" is revoked`)
  }
}
