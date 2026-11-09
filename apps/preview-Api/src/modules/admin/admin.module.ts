import { Module } from "@nestjs/common";
import {
  AdminController,
  AdminOperationsController,
} from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  controllers: [AdminController, AdminOperationsController],
  providers: [AdminService],
})
export class AdminModule {}
