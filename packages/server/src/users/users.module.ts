import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { User } from "./user.entity.js"
import { UsersController } from "./users.controller.js"

@Module({
  imports: [
    DbModule.forFeature([User]),
  ],
  controllers: [
    UsersController,
  ],
})
export class UsersModule { }
