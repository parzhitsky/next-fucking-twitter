import { Injectable } from "@nestjs/common"
import { compare } from 'bcryptjs'
import { ClientError } from "@/app/app-error/app-error.js"
import { UsersService } from "@/users/users.service.js"
import { UserCreds } from "./user-creds.dto.js"
import { TokensService } from "./tokens/tokens.service.js"

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
}

export class SignInError extends ClientError {
  public override readonly statusCode = '401'

  constructor(public readonly userAlias: string) {
    super(`Could not authorize user "${userAlias}": unknown user or invalid password`)
  }
}
