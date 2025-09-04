import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ServerError } from "@/app/app-error/app-error.js"
import { REFRESH_TOKEN_TTL } from "./jwt-codec.service.js"
import { RefreshToken } from "./refresh-token.entity.js"

interface CreateParams {
  readonly userId: string
  readonly oldTokenId?: string
}

interface InactiveReason {
  readonly expired?: true
  readonly revoked?: true
}

@Injectable()
export class RefreshTokenRecordService {
  constructor(
    @InjectRepository(RefreshToken)
    protected readonly refreshTokenRepo: Repository<RefreshToken>,
  ) { }

  async create({ userId, oldTokenId }: CreateParams): Promise<RefreshToken> {
    const record = this.refreshTokenRepo.create({
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
      generatedFromId: oldTokenId ?? null,
    })

    return this.refreshTokenRepo.save(record)
  }

  async getById(id: string): Promise<RefreshToken> {
    const record = await this.refreshTokenRepo.findOneBy({ id })

    if (record == null) {
      throw new RefreshTokenNotFoundError(id)
    }

    return record
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepo.findBy({ userId })
  }

  findInactiveReason(record: RefreshToken): InactiveReason | null {
    const now = new Date()

    if (record.expiresAt <= now) {
      return {
        expired: true,
      }
    }

    if (record.revokedAt == null) {
      return null
    }

    if (record.revokedAt >= now) {
      throw new RefreshTokenRevokedInFutureError(record.id)
    }

    return {
      revoked: true,
    }
  }

  async revoke(record: RefreshToken): Promise<void> {
    if (record.revokedAt != null) {
      return
    }

    record.revokedAt = new Date()

    await this.refreshTokenRepo.save(record)
  }
}

export class RefreshTokenNotFoundError extends ServerError {
  public override readonly statusCode = '500'

  constructor(public readonly tokenId: string) {
    super(`Refresh token "${tokenId}" was not found in the DB`)

    this.addDetail({
      public: false,
      message: `Record "${tokenId}" is expected to exist in the refresh token table, but was not found`,
      payload: tokenId,
    })
  }
}

export class RefreshTokenRevokedInFutureError extends ServerError {
  protected static readonly detailMessage = "Refresh token being revoked in the future does not make sense in the context of the current implementation"

  public override readonly statusCode = '500'

  constructor(public readonly tokenId: string) {
    super(`Refresh token "${tokenId}" is marked to will have been revoked in the future`)

    this.addDetail({
      public: false,
      message: new.target.detailMessage,
      payload: tokenId,
    })
  }
}
