import { Injectable } from "@nestjs/common"
import { ClientError } from "@/app/app-error/app-error.js"
import { compare, create } from "@/common/password-hash.js"
import { UsersService } from "@/users/users.service.js"
import { UserCreds } from "./user-creds.dto.js"
import { AccessTokenPayload, TokensService } from "./tokens/tokens.service.js"

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(
    protected readonly userService: UsersService,
    protected readonly tokensService: TokensService,
  ) { }

  async signUp({ userAlias, password }: UserCreds): Promise<void> {
    const user = await this.userService.findByAlias(userAlias)

    if (user != null) {
      throw new AliasTakenError(userAlias)
    }

    const passwordHash = await create(password)

    await this.userService.create(userAlias, passwordHash)
  }

  async signIn({ userAlias, password }: UserCreds): Promise<TokenPair> {
    const user = await this.userService.findByAlias(userAlias)

    if (!user) {
      throw new SignInError(userAlias)
    }

    const passed = await compare(password, user.passwordHash)

    if (!passed) {
      throw new SignInError(userAlias)
    }

    const userData = this.tokensService.createUserData({
      sub: user.id,
      alias: user.alias,
    })

    const [accessToken, refreshToken] = await Promise.all([
      this.tokensService.generateAccessToken(userData),
      this.tokensService.generateRefreshToken(userData),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  async authorize(accessToken: string): Promise<AccessTokenPayload> {
    return this.tokensService.verifyAccessToken(accessToken)
  }
}

export class AliasTakenError extends ClientError {
  public override readonly statusCode = '409'

  constructor(public readonly userAlias: string) {
    super(`Could not register user "${userAlias}": this alias is already taken`)
  }
}

export class SignInError extends ClientError {
  public override readonly statusCode = '401'

  constructor(public readonly userAlias: string) {
    super(`Could not sign user "${userAlias}" in: user is unknown user or password is invalid`)
  }
}
