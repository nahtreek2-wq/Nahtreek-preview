import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../../common/strategies/jwt.strategy';
import { ClientsService } from './clients.service';
import { UpdateClientProfileDto, UploadPhotoDto } from './dto/update-client-profile.dto';

@Controller('clients/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async me(@CurrentUser() user: JwtPayload) {
    return this.clientsService.me(user.sub);
  }

  @Patch()
  async updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateClientProfileDto) {
    return this.clientsService.updateMe(user.sub, dto);
  }

  @Post('photo')
  photo(@CurrentUser() user: JwtPayload, @Body() dto: UploadPhotoDto) { return this.clientsService.photo(user.sub, dto); }
}
