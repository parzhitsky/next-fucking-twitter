import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ClientError } from "@/app/app-error/app-error.js"
import { compare, create } from "./password-hash.js"
import { User } from "./user.entity.js"
import { UserCreds } from "./user-creds.dto.js"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    protected readonly repo: Repository<User>,
  ) { }

  async create({ userAlias, password }: UserCreds): Promise<User> {
    const existing = await this.findByAlias(userAlias)

    if (existing != null) {
      throw new AliasAlreadyTakenError(userAlias)
    }

    const passwordHash = await create(password)

    const user = this.repo.create({ alias: userAlias, passwordHash })

    return this.repo.save(user)
  }

  async findByAlias(alias: string): Promise<User | null> {
    return this.repo.findOneBy({ alias })
  }

  async getByAlias(alias: string): Promise<User> {
    const user = await this.findByAlias(alias)

    if (!user) {
      throw new UserNotFoundByAliasError(alias)
    }

    return user
  }

  async findByCreds({ userAlias, password }: UserCreds): Promise<User | null> {
    const user = await this.findByAlias(userAlias)
    const passed = user && await compare(password, user.passwordHash)

    return passed ? user : null
  }
}

export class AliasAlreadyTakenError extends ClientError {
  public override readonly statusCode = '409'

  constructor(public readonly userAlias: string) {
    super(`Could not register user "${userAlias}": this alias is already taken`)
  }
}

export class UserNotFoundByAliasError extends ClientError {
  public override readonly statusCode = '404'

  constructor(public readonly userAlias: string) {
    super(`User "${userAlias}" was not found`)
  }
}
