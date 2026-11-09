import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { JwtPayload } from "../../common/strategies/jwt.strategy";
import {
  CreateServiceRequestDto,
  CreateAvailabilitySlotDto,
  ProfessionalIdentityDraftDto,
  ProfessionalPhotoDto,
  PortfolioPhotoDto,
  ProfessionalSetupDto,
  ServiceCategoryDto,
  TransitionDto,
  VerificationDocumentUploadDto,
  WorkStatusDto,
} from "./platform.dto";
import { PlatformService } from "./platform.service";
import { JourneyService } from "./journey.service";
import { RequestsService } from "../requests/requests.service";
import { CreateReviewDto } from "../requests/dto/create-review.dto";

@Controller("discovery")
export class PlatformDiscoveryController {
  constructor(private readonly service: PlatformService) {}
  @Get("services") categories() {
    return this.service.categories();
  }
  @Get("providers") providers(
    @Query("city") city?: string,
    @Query("serviceId") serviceId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("state") state?: string
  ) {
    return this.service.providers({ city, state, serviceId, page, limit });
  }
}

@Controller("professionals")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ENGINEER, Role.SERVICE_PROVIDER)
export class ProfessionalsController {
  constructor(private readonly service: PlatformService) {}
  @Get("me") me(@CurrentUser() user: JwtPayload) {
    return this.service.professional(user.sub);
  }
  @Get("me/review-qr") reviewQr(@CurrentUser() user: JwtPayload) {
    return this.service.reviewQr(user.sub);
  }
  @Put("me") setup(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ProfessionalSetupDto
  ) {
    return this.service.setup(user.sub, dto);
  }
  @Patch("me/identity")
  saveIdentity(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ProfessionalIdentityDraftDto
  ) {
    return this.service.saveProfessionalIdentity(user.sub, dto);
  }
  @Post("me/photo")
  photo(@CurrentUser() user: JwtPayload, @Body() dto: ProfessionalPhotoDto) {
    return this.service.professionalPhoto(user.sub, dto);
  }
  @Post("me/portfolio")
  addPortfolio(@CurrentUser() user: JwtPayload, @Body() dto: PortfolioPhotoDto) {
    return this.service.addPortfolio(user.sub, dto);
  }
  @Delete("me/portfolio/:id")
  removePortfolio(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.removePortfolio(user.sub, id);
  }
  @Get("me/verification-documents")
  verificationDocuments(@CurrentUser() user: JwtPayload) {
    return this.service.verificationDocuments(user.sub);
  }
  @Post("me/verification-documents")
  uploadVerificationDocument(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerificationDocumentUploadDto
  ) {
    return this.service.uploadVerificationDocument(user.sub, dto);
  }
  @Post("me/verification/submit")
  submitVerification(@CurrentUser() user: JwtPayload) {
    return this.service.submitVerification(user.sub);
  }
  @Get("me/availability")
  availability(
    @CurrentUser() user: JwtPayload,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.service.availability(user.sub, { from, to });
  }
  @Post("me/availability")
  createAvailability(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAvailabilitySlotDto
  ) {
    return this.service.createAvailability(user.sub, dto);
  }
  @Delete("me/availability/:slotId")
  deleteAvailability(
    @CurrentUser() user: JwtPayload,
    @Param("slotId") slotId: string
  ) {
    return this.service.deleteAvailability(user.sub, slotId);
  }
  @Patch("me/work-status")
  setWorkStatus(@CurrentUser() user: JwtPayload, @Body() dto: WorkStatusDto) {
    return this.service.setWorkStatus(user.sub, dto.isAvailable);
  }
}

@Controller("service-requests")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceRequestsController {
  constructor(private readonly service: PlatformService, private readonly requests: RequestsService, private readonly journey: JourneyService) {}
  @Post()
  @Roles(Role.CLIENT)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateServiceRequestDto
  ) {
    return this.service.createRequest(user.sub, dto);
  }
  @Get() async list(
    @CurrentUser() user: JwtPayload,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    await this.journey.expire(undefined, user.sub);
    return this.service.requests(user.sub, { page, limit });
  }
  @Get(":id") async detail(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    await this.journey.expire(id, user.sub);
    return this.service.detail(user.sub, id);
  }
  @Post(":id/reviews")
  @Roles(Role.CLIENT)
  addReview(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() review: CreateReviewDto) {
    return this.requests.addServiceReview(id, user.sub, review);
  }
  @Patch(":id/status") transition(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: TransitionDto
  ) {
    return this.service.transition(user.sub, id, dto);
  }
}

@Controller("history/me")
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly service: PlatformService) {}
  @Get() list(
    @CurrentUser() user: JwtPayload,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.service.history(user.sub, { page, limit });
  }
}

@Controller("admin/services")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ServiceAdminController {
  constructor(private readonly service: PlatformService) {}
  @Put() save(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ServiceCategoryDto
  ) {
    return this.service.saveCategory(dto, user.sub);
  }
}
