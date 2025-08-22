import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "./user.entity.js"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    protected readonly repo: Repository<User>,
  ) {}

  async findByAlias(alias: string): Promise<User | null> {
    return this.repo.findOneBy({ alias })
  }
}
