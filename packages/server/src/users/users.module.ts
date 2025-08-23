import { Module } from "@nestjs/common"
import { DbModule } from "@/db/db.module.js"
import { Following } from "./following.entity.js"
import { FollowingsService } from "./followings.service.js"
import { User } from "./user.entity.js"
import { UsersController } from "./users.controller.js"
import { UsersService } from "./users.service.js"

@Module({
  imports: [
    DbModule.forFeature([User, Following]),
  ],
  providers: [
    UsersService,
    FollowingsService,
  ],
  controllers: [
    UsersController,
  ],
  exports: [
    UsersService,
    FollowingsService,
  ],
})
export class UsersModule { }
