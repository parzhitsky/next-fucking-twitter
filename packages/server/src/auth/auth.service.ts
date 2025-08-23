import { Injectable } from "@nestjs/common"
import { ClientError } from "@/app/app-error/app-error.js"
import { compare, create } from "@/common/password-hash.js"
import { UsersService } from "@/users/users.service.js"
import { TokensService, TokenPair } from "./tokens/tokens.service.js"
import { UserCreds } from "./user-creds.dto.js"

@Injectable()
export class AuthService {
  constructor(
    protected readonly userService: UsersService,
    protected readonly tokensService: TokensService,
  ) { }

  async signUp({ userAlias, password }: UserCreds): Promise<void> {
    const user = await this.userService.findByAlias(userAlias)

    if (user != null) {
      throw new AliasAlreadyTakenError(userAlias)
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

    return this.tokensService.generatePair({
      sub: user.id,
      alias: user.alias,
    })
  }
}

export class AliasAlreadyTakenError extends ClientError {
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
