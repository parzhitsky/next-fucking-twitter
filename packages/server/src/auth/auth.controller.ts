import { Controller, HttpCode, HttpStatus, NotImplementedException, Post } from "@nestjs/common"

@Controller('auth')
export class AuthController {
  // TODO: (body) userAlias + password
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }

  // TODO: (body) userAlias + password
  @Post('signin')
  async signIn(): Promise<Api.HttpResponseBody<never>> {
    throw new NotImplementedException()
  }
}
