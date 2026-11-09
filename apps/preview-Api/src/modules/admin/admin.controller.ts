import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { JwtPayload } from "../../common/strategies/jwt.strategy";
import { AdminService } from "./admin.service";
import {
  AdminProfileDto,
  AdminUpdateUserDto,
  DocumentReviewDto,
  ProfileReviewDto,
  UserStatusDto,
} from "./admin.dto";

@Controller("admin/verifications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get("summary")
  summary() {
    return this.service.summary();
  }

  @Get()
  list(
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.service.list({ status, search, page, limit });
  }

  @Get(":profileId")
  detail(@Param("profileId") profileId: string) {
    return this.service.detail(profileId);
  }

  @Patch(":profileId")
  reviewProfile(
    @CurrentUser() user: JwtPayload,
    @Param("profileId") profileId: string,
    @Body() dto: ProfileReviewDto
  ) {
    return this.service.reviewProfile(profileId, user.sub, dto);
  }

  @Patch(":profileId/documents/:documentId")
  reviewDocument(
    @CurrentUser() user: JwtPayload,
    @Param("profileId") profileId: string,
    @Param("documentId") documentId: string,
    @Body() dto: DocumentReviewDto
  ) {
    return this.service.reviewDocument(profileId, documentId, user.sub, dto);
  }
}

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminOperationsController {
  constructor(private readonly service: AdminService) {}

  @Get("profile")
  profile(@CurrentUser() admin: JwtPayload) {
    return this.service.adminProfile(admin.sub);
  }

  @Patch("profile")
  updateProfile(
    @CurrentUser() admin: JwtPayload,
    @Body() dto: AdminProfileDto
  ) {
    return this.service.updateAdminProfile(admin.sub, dto);
  }

  @Get("activity")
  activity(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.service.activity(page, limit);
  }

  @Get("overview")
  overview() {
    return this.service.overview();
  }

  @Get("users")
  users(
    @Query("role") role?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.service.listUsers({ role, status, search, page, limit });
  }

  @Get("users/:userId")
  user(@Param("userId") userId: string) {
    return this.service.userDetail(userId);
  }

  @Patch("users/:userId/details")
  updateUserDetails(
    @CurrentUser() admin: JwtPayload,
    @Param("userId") userId: string,
    @Body() dto: AdminUpdateUserDto
  ) {
    return this.service.updateUserDetails(userId, admin.sub, dto);
  }

  @Patch("users/:userId/status")
  changeUserStatus(
    @CurrentUser() admin: JwtPayload,
    @Param("userId") userId: string,
    @Body() dto: UserStatusDto
  ) {
    return this.service.changeUserStatus(userId, admin.sub, dto);
  }
}
