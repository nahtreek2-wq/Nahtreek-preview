import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {IsBoolean, IsOptional} from 'class-validator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../../common/strategies/jwt.strategy';
import { NotificationsService } from './notifications.service';

class NotificationPreferencesDto {
  @IsOptional() @IsBoolean() requestUpdates?: boolean;
  @IsOptional() @IsBoolean() messages?: boolean;
  @IsOptional() @IsBoolean() offers?: boolean;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT, Role.ENGINEER, Role.SERVICE_PROVIDER)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('preferences')
  preferences(@CurrentUser() user: JwtPayload) {return this.notificationsService.preferences(user.sub);}

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: JwtPayload, @Body() dto: NotificationPreferencesDto) {
    return this.notificationsService.updatePreferences(user.sub, dto);
  }

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.list(user.sub, { page, limit });
  }

  @Patch('mark-all-read')
  async markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllRead(user.sub);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.markRead(id, user.sub);
  }
}
