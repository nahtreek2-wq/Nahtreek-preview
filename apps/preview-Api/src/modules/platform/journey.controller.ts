import {Body, Controller, Get, Headers, Param, Post, UnauthorizedException, UseGuards} from '@nestjs/common';
import {timingSafeEqual} from 'crypto';
import {Role} from '@prisma/client';
import {Roles} from '../../common/decorators/roles.decorator';
import {RolesGuard} from '../../common/guards/roles.guard';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/current-user.decorator';
import {JwtPayload} from '../../common/strategies/jwt.strategy';
import {JourneyService} from './journey.service';
import {BookDto, JourneyActionDto, MatchDto, PresenceDto} from './journey.dto';
@Controller('service-workflow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JourneyController {
  constructor(private readonly service: JourneyService) {}
  @Post('presence') @Roles(Role.SERVICE_PROVIDER) presence(@CurrentUser() user: JwtPayload, @Body() dto: PresenceDto) {return this.service.presence(user.sub,dto);}
  @Post('matches') @Roles(Role.CLIENT) matches(@CurrentUser() user: JwtPayload, @Body() dto: MatchDto) {return this.service.matches(user.sub,dto);}
  @Post('book') @Roles(Role.CLIENT) book(@CurrentUser() user: JwtPayload, @Body() dto: BookDto) {return this.service.book(user.sub,dto);}
  @Get(':id') read(@CurrentUser() user: JwtPayload, @Param('id') id: string) {return this.service.read(user.sub,id);}
  @Post(':id/actions') action(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: JourneyActionDto) {return this.service.action(user.sub,id,dto);}
}
@Controller('internal/service-workflow')
export class JourneyMaintenanceController {
  constructor(private readonly service: JourneyService) {}
  @Post('expire') async expire(@Headers('authorization') authorization?: string) {
    const secret=process.env.CRON_SECRET;
    const expected=Buffer.from(`Bearer ${secret??''}`);const actual=Buffer.from(authorization??'');
    if(!secret||secret.length<32||actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new UnauthorizedException();
    await this.service.expire();return {ok:true};
  }
}
