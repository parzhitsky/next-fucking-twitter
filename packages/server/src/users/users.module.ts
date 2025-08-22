import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { User } from "./user.entity.js"
import { UsersController } from "./users.controller.js"
import { UsersService } from "./users.service.js"

@Module({
  imports: [
    DbModule.forFeature([User]),
  ],
  providers: [
    UsersService,
  ],
  controllers: [
    UsersController,
  ],
  exports: [
    UsersService,
  ],
})
export class UsersModule { }
