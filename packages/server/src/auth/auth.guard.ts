import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { NotBeforeError, TokenExpiredError } from "@nestjs/jwt"
import { Request } from "express"
import { ClientError } from "@/app/app-error/app-error.js"
import { AuthService } from "./auth.service.js"
import { OPEN } from "./open.decorator.js"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    protected readonly authService: AuthService,
    protected readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const open: boolean = this.reflector.getAllAndOverride(OPEN, [
      context.getHandler(),
      context.getClass(),
    ])

    if (open) {
      return true
    }

    const req = context.switchToHttp().getRequest<Request>()
    const token = req.cookies.access_token

    if (!token) {
      return false
    }

    try {
      await this.authService.authorize(token)
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AccessTokenExpiredError(error.expiredAt)
      }

      if (error instanceof NotBeforeError) {
        throw new AccessTokenInactiveError(error.date)
      }

      throw new AccessTokenError()
        .addDetailIf(error instanceof Error, () => ({
          public: true,
          message: (error as Error).message,
        }))
    }

    return true
  }
}

export class AccessTokenExpiredError extends ClientError {
  public override readonly statusCode = '403'

  constructor(public readonly expiredAt: Date) {
    super('Access token had expired')

    this.addDetail({
      public: true,
      message: `Access token had expired at ${expiredAt}`,
      payload: expiredAt,
    })
  }
}

export class AccessTokenInactiveError extends ClientError {
  public override readonly statusCode = '403'

  constructor(public readonly notBefore: Date) {
    super('Access token is not yet active')

    this.addDetail({
      public: true,
      message: `Access token becomes active at ${notBefore}`,
      payload: notBefore,
    })
  }
}

export class AccessTokenError extends ClientError {
  public override readonly statusCode = '403'

  constructor() {
    super('Unknown access token error')
  }
}
