import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Request } from "express"
import { ServerError } from "@/app/app-error/app-error.js"

export interface AccessClaims {
  readonly userId: string
  readonly userAlias: string
}

export const AccessClaims = createParamDecorator((data: never, context: ExecutionContext): AccessClaims => {
  const req = context.switchToHttp().getRequest<Request>()

  if (!req.accessTokenPayload) {
    throw new AccessTokenPayloadMissingError()
  }

  return {
    userId: req.accessTokenPayload.sub,
    userAlias: req.accessTokenPayload.alias,
  }
})

export class AccessTokenPayloadMissingError extends ServerError {
  public override readonly statusCode = '500'

  constructor() {
    super('Expected access token payload to have been put on the `req` object, instead saw none')
  }
}
