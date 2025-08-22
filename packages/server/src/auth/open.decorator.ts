import { SetMetadata } from "@nestjs/common"

export const OPEN = Symbol('Open')

export const Open = () => SetMetadata(OPEN, true)
