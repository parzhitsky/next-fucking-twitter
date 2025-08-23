import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Request } from "express"
import { ClientError, ServerError } from "@/app/app-error/app-error.js"
import { OPEN } from "./open.decorator.js"
import { AccessTokenPayload, TokensService } from "./tokens/tokens.service.js"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      accessTokenPayload?: AccessTokenPayload
    }
  }
}

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

    if (req.accessTokenPayload != null) {
      throw new AccessTokenPayloadAlreadyExtractedError(token)
    }

    const payload = await this.tokensService.verifyToken('access', token)

    req.accessTokenPayload = payload

    return true
  }
}

export class AccessTokenCookieMissingError extends ClientError {
  public override readonly statusCode = '403'

  constructor() {
    super('Cannot authenticate: `access_token` cookie is missing')
  }
}

export class AccessTokenPayloadAlreadyExtractedError extends ServerError {
  public override readonly statusCode = '500'

  constructor(public readonly accessToken: string) {
    super('Access token payload had been extracted earlier and already exists on the `req` object')

    this.addDetail({
      public: false,
      message: 'Expected access token payload to have not been extracted yet',
      payload: accessToken,
    })
  }
}
