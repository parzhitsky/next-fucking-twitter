import { Injectable } from "@nestjs/common"
import { ClientError } from "@/app/app-error/app-error.js"
import { User } from "@/users/user.entity.js"
import { UsersService } from "@/users/users.service.js"
import { UserCreds } from "@/users/user-creds.dto.js"
import { TokensService, TokenPair } from "./tokens/tokens.service.js"

@Injectable()
export class AuthService {
  constructor(
    protected readonly userService: UsersService,
    protected readonly tokensService: TokensService,
  ) { }

  async signUp(creds: UserCreds): Promise<void> {
    await this.userService.create(creds)
  }

  protected async getUserByCreds(creds: UserCreds): Promise<User> {
    const user = await this.userService.findByCreds(creds)

    if (!user) {
      throw new SignInError(creds.userAlias)
    }

    return user
  }

  async signIn(creds: UserCreds): Promise<TokenPair> {
    const user = await this.getUserByCreds(creds)

    return this.tokensService.generatePair(user.id, user.alias)
  }

  async signOut(creds: UserCreds): Promise<void> {
    const user = await this.getUserByCreds(creds)

    await this.tokensService.revokeAllRefreshTokensByUserId(user.id)
  }
}

export class SignInError extends ClientError {
  public override readonly statusCode = '401'

  constructor(public readonly userAlias: string) {
    super(`Could not sign user "${userAlias}" in: user is unknown user or password is invalid`)
  }
}
