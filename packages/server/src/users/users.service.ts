import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ClientError } from "@/app/app-error/app-error.js"
import { PasswordHash } from "@/common/password-hash.js"
import { User } from "./user.entity.js"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    protected readonly repo: Repository<User>,
  ) { }

  async create(alias: string, passwordHash: PasswordHash): Promise<User> {
    const user = this.repo.create({ alias, passwordHash })

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
}

export class UserNotFoundByAliasError extends ClientError {
  public override readonly statusCode = '404'

  constructor(public readonly userAlias: string) {
    super(`User "${userAlias}" was not found`)
  }
}
