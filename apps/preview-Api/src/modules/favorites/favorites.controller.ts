import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../../common/strategies/jwt.strategy';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.list(user.sub);
  }

  @Post()
  async add(@CurrentUser() user: JwtPayload, @Body() body: CreateFavoriteDto) {
    return this.favoritesService.add(user.sub, body.professionalId);
  }

  @Delete(':professionalId')
  async remove(@CurrentUser() user: JwtPayload, @Param('professionalId') professionalId: string) {
    return this.favoritesService.remove(user.sub, professionalId);
  }
}
