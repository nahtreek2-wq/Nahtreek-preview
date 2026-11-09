import {Body, Controller, Get, Headers, Post, UnauthorizedException, UseGuards} from '@nestjs/common';
import {IsIn, IsString, MaxLength, MinLength} from 'class-validator';
import {timingSafeEqual} from 'crypto';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/current-user.decorator';
import {JwtPayload} from '../../common/strategies/jwt.strategy';
import {PushService} from './push.service';

class TokenDto {
  @IsString() @MinLength(20) @MaxLength(4096) token: string;
}
class RegisterTokenDto extends TokenDto {
  @IsIn(['client', 'professional']) app: string;
}

@Controller('notifications/devices')
@UseGuards(JwtAuthGuard)
export class PushDevicesController {
  constructor(private readonly push: PushService) {}
  @Post() register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterTokenDto) {return this.push.register(user, dto.token, dto.app);}
  @Post('remove') remove(@CurrentUser() user: JwtPayload, @Body() dto: TokenDto) {return this.push.unregister(user.sub, dto.token);}
}

@Controller('internal/push')
export class PushDispatchController {
  constructor(private readonly push: PushService) {}
  @Get('dispatch') get(@Headers('authorization') authorization?: string) {return this.run(authorization);}
  @Post('dispatch') post(@Headers('authorization') authorization?: string) {return this.run(authorization);}
  private run(authorization?: string) {
    const secret = process.env.CRON_SECRET;
    const expected = Buffer.from(`Bearer ${secret ?? ''}`);
    const actual = Buffer.from(authorization ?? '');
    if (!secret || secret.length < 32 || actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new UnauthorizedException();
    return this.push.dispatch();
  }
}
