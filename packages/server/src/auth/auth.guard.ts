import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Request } from "express"
import { ClientError } from "@/app/app-error/app-error.js"
import { OPEN } from "./open.decorator.js"
import { TokensService } from "./tokens/tokens.service.js"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected readonly tokensService: TokensService,
    protected readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isOpen: boolean = this.reflector.getAllAndOverride(OPEN, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isOpen) {
      return true
    }

    const req = context.switchToHttp().getRequest<Request>()
    const token = req.cookies.access_token

    if (!token) {
      throw new AccessTokenCookieMissingError()
    }

    await this.tokensService.verifyToken('access', token)

    return true
  }
}

export class AccessTokenCookieMissingError extends ClientError {
  public override readonly statusCode = '403'

  constructor() {
    super('Cannot authenticate: `access_token` cookie is missing')
  }
}
