import { Injectable } from "@nestjs/common"
import { JwtService, JwtSignOptions } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ConfigService } from "@/config/config.service.js"
import { RefreshToken } from "./refresh-token.entity.js"

export const ACCESS_TOKEN_TTL = 60_000

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
    expiresIn: '7d',
  }

  constructor(
    protected readonly config: ConfigService,
    protected readonly jwtService: JwtService,

    @InjectRepository(RefreshToken)
    protected readonly refreshTokenRepo: Repository<RefreshToken>,
  ) { }

  // this exists to hold typing responsibility
  createUserData({ sub, alias }: TokenUserData): TokenUserData {
    return { sub, alias }
  }

  async generateAccessToken(userData: TokenUserData): Promise<string> {
    return this.jwtService.signAsync(userData, this.accessTokenOptions)
  }

  async generateRefreshToken(userData: TokenUserData): Promise<string> {
    const record = this.refreshTokenRepo.create()
    const payload: RefreshTokenPayload = {
      ...userData,
      jti: record.id,
    }

    const [token] = await Promise.all([
      this.jwtService.signAsync(payload, this.refreshTokenOptions),
      this.refreshTokenRepo.save(record),
    ])

    return token
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(token, this.withSecret)
  }
}
