import {Body, Controller, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {Role} from '@prisma/client';
import {CurrentUser} from '../../common/decorators/current-user.decorator';
import {Roles} from '../../common/decorators/roles.decorator';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {RolesGuard} from '../../common/guards/roles.guard';
import {JwtPayload} from '../../common/strategies/jwt.strategy';
import {AiService} from './ai.service';
import {AnalyzeAiDocumentDto, CreateAiConversationDto, CreateAiMessageDto, GenerateAiPlanDto, QuoteRequestFromPlanDto, UpdateAiPlanDto, UploadAiDocumentDto} from './ai.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class AiController {
  constructor(private readonly ai: AiService) {}
  @Post('conversations') create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAiConversationDto) { return this.ai.createConversation(user.sub, dto); }
  @Get('conversations') list(@CurrentUser() user: JwtPayload) { return this.ai.listConversations(user.sub); }
  @Get('conversations/:id') detail(@CurrentUser() user: JwtPayload, @Param('id') id: string) { return this.ai.detail(user.sub, id); }
  @Post('conversations/:id/messages') message(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: CreateAiMessageDto) { return this.ai.message(user.sub, id, dto); }
  @Post('conversations/:id/plans') plan(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: GenerateAiPlanDto) { return this.ai.generatePlan(user.sub, id, dto); }
  @Post('documents') upload(@CurrentUser() user: JwtPayload, @Body() dto: UploadAiDocumentDto) { return this.ai.uploadDocument(user.sub, dto); }
  @Get('documents/:id') document(@CurrentUser() user: JwtPayload, @Param('id') id: string) { return this.ai.documentStatus(user.sub, id); }
  @Post('documents/:id/analyze') analyze(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: AnalyzeAiDocumentDto) { return this.ai.analyzeDocument(user.sub, id, dto); }
  @Get('plans') plans(@CurrentUser() user: JwtPayload) { return this.ai.listPlans(user.sub); }
  @Get('plans/:id') planDetail(@CurrentUser() user: JwtPayload, @Param('id') id: string) { return this.ai.planDetail(user.sub, id); }
  @Patch('plans/:id') update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAiPlanDto) { return this.ai.updatePlan(user.sub, id, dto); }
  @Post('plans/:id/quote-request') quoteRequest(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: QuoteRequestFromPlanDto) { return this.ai.quoteRequest(user.sub, id, dto); }
  @Get('rate-cards') rateCards(@CurrentUser() user: JwtPayload, @Query('city') city?: string) { void user; return this.ai.rateCards(city); }
  @Get('admin/health') @Roles(Role.ADMIN) health() { return this.ai.engineHealth(); }
}
