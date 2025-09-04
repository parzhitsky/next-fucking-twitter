import { Injectable } from "@nestjs/common"
import { ClientError } from "@/app/app-error/app-error.js"
import { createLogger } from "@/common/create-logger.js"
import { AccessTokenPayload, JwtCodec, RefreshTokenPayload } from "./jwt-codec.service.js"
import { RefreshToken } from "./refresh-token.entity.js"
import { RefreshTokenRecordService } from "./refresh-token-record.service.js"

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

@Injectable()
export class TokensService {
  protected readonly logger = createLogger(this.constructor)

  constructor(
    protected readonly jwtCodec: JwtCodec,
    protected readonly refreshTokenRecordService: RefreshTokenRecordService,
  ) { }

  async generatePair(userId: string, userAlias: string, oldRefreshTokenId?: string): Promise<TokenPair> {
    const record = await this.refreshTokenRecordService.create({
      userId,
      oldTokenId: oldRefreshTokenId,
    })

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtCodec.encodeAccessToken(userId, userAlias),
      this.jwtCodec.encodeRefreshToken(userId, userAlias, record.id),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  async validateAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtCodec.decodeToken('access', token)
  }

  protected async resolveRefreshToken(token: string): Promise<[RefreshToken, RefreshTokenPayload]> {
    const payload = await this.jwtCodec.decodeToken('refresh', token)
    const record = await this.refreshTokenRecordService.getById(payload.jti)

    return [record, payload]
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const [record] = await this.resolveRefreshToken(token)

    await this.refreshTokenRecordService.revoke(record)
  }

  async revokeAllRefreshTokensByUserId(userId: string): Promise<number> {
    const tokens = await this.refreshTokenRecordService.findByUserId(userId)
    const tokensRevoked = tokens.map((token) => this.refreshTokenRecordService.revoke(token))
    const results = await Promise.allSettled(tokensRevoked)

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        this.logger.warn(result.reason)
      }
    }

    return tokens.length
  }

  async refreshPair(refreshToken: string): Promise<TokenPair> {
    const [record, payload] = await this.resolveRefreshToken(refreshToken)

    const inactive = this.refreshTokenRecordService.findInactiveReason(record)

    if (inactive) {
      throw new RefreshTokenInactiveError(record.id)
        .addDetailIf(inactive.revoked!, () => ({
          public: true,
          message: `Refresh token was revoked at ${record.revokedAt}`,
          payload: record.revokedAt!,
        }))
        .addDetailIf(inactive.expired!, () => ({
          public: true,
          message: `Refresh token had expired at ${record.expiresAt}`,
          payload: record.expiresAt!,
        }))
    }

    const [tokenPair] = await Promise.all([
      this.generatePair(payload.sub, payload.alias, payload.jti),
      this.refreshTokenRecordService.revoke(record),
    ])


    return tokenPair
  }
}

export class RefreshTokenInactiveError extends ClientError {
  public override readonly statusCode = '403'

  constructor(public readonly tokenId: string) {
    super(`Refresh token "${tokenId}" is revoked`)
  }
}
