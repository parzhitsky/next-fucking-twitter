import { Injectable, type NestMiddleware } from '@nestjs/common'
import cookieParser from 'cookie-parser'

@Injectable()
export class CookieParserMiddleware implements NestMiddleware {
  use = cookieParser()
}
