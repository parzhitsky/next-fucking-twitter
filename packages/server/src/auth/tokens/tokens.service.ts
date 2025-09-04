import { Injectable } from "@nestjs/common"
import { ClientError } from "@/app/app-error/app-error.js"
import { JwtCodec, RefreshTokenPayload } from "./jwt-codec.service.js"
import { RefreshToken } from "./refresh-token.entity.js"
import { RefreshTokenRecordService } from "./refresh-token-record.service.js"

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

@Injectable()
export class TokensService {
  constructor(
    protected readonly jwtCodec: JwtCodec,
    protected readonly refreshTokenRecordService: RefreshTokenRecordService,
  ) { }

  async generatePair(userId: string, userAlias: string, oldRefreshTokenId?: string): Promise<TokenPair> {
    const record = await this.refreshTokenRecordService.create(oldRefreshTokenId)
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtCodec.encodeAccessToken(userId, userAlias),
      this.jwtCodec.encodeRefreshToken(userId, userAlias, record.id),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  protected async verifyRefreshToken(token: string): Promise<[RefreshTokenPayload, RefreshToken]> {
    const payload = await this.jwtCodec.decodeToken('refresh', token)
    const record = await this.refreshTokenRecordService.getById(payload.jti)

    return [payload, record]
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const [, record] = await this.verifyRefreshToken(token)

    await this.refreshTokenRecordService.markAsRevoked(record)
  }

  async refreshPair(refreshToken: string): Promise<TokenPair> {
    const [payload, record] = await this.verifyRefreshToken(refreshToken)

    const isRevoked = this.refreshTokenRecordService.getIsRevoked(record)

    if (isRevoked) {
      throw new RefreshTokenRevokedError(record.id)
        .addDetail({
          public: true,
          message: `Refresh token was revoked at ${record.revokedAt}`,
          payload: record.revokedAt!,
        })
    }

    await this.refreshTokenRecordService.markAsRevoked(record)

    const tokenPair = await this.generatePair(payload.sub, payload.alias, payload.jti)

    return tokenPair
  }
}

export class RefreshTokenRevokedError extends ClientError {
  public override readonly statusCode = '403'

  constructor(public readonly tokenId: string) {
    super(`Refresh token "${tokenId}" is revoked`)
  }
}
