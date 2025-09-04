import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ServerError } from "@/app/app-error/app-error.js"
import { RefreshToken } from "./refresh-token.entity.js"

@Injectable()
export class RefreshTokenRecordService {
  constructor(
    @InjectRepository(RefreshToken)
    protected readonly refreshTokenRepo: Repository<RefreshToken>,
  ) { }

  async create(oldTokenId?: string): Promise<RefreshToken> {
    const record = this.refreshTokenRepo.create({
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

  getIsRevoked(record: RefreshToken): boolean {
    if (record.revokedAt == null) {
      return false
    }

    if (record.revokedAt.getTime() >= Date.now()) {
      throw new RefreshTokenRevokedInFutureError(record.id)
    }

    return true
  }

  async markAsRevoked(record: RefreshToken): Promise<void> {
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
