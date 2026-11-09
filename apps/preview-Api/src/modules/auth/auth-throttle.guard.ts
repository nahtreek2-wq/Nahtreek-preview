import {CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {createHash} from 'crypto';
import {PrismaService} from '../../common/prisma/prisma.service';

@Injectable()
export class AuthThrottleGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  private async consume(identity: string, limit: number) {
    const key = createHash('sha256').update(identity).digest('hex');
    const rows = await this.prisma.$queryRaw<{count: number}[]>`
      INSERT INTO "RateLimitWindow" ("key", "count", "expiresAt")
      VALUES (${key}, 1, NOW() + INTERVAL '1 minute')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimitWindow"."expiresAt" <= NOW() THEN 1 ELSE "RateLimitWindow"."count" + 1 END,
        "expiresAt" = CASE WHEN "RateLimitWindow"."expiresAt" <= NOW() THEN NOW() + INTERVAL '1 minute' ELSE "RateLimitWindow"."expiresAt" END
      RETURNING "count"`;
    if (rows[0].count > limit) {
      throw new HttpException('Too many attempts. Wait a minute and try again.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.method !== 'POST') return true;
    const endpoint = req.route?.path ?? req.path;
    await this.consume('ip:' + (req.ip ?? req.socket?.remoteAddress ?? 'unknown'), 30);
    const raw = req.body?.phoneNumber ?? req.body?.email;
    if (typeof raw === 'string') {
      const normalized = raw.includes('@')
        ? raw.trim().toLowerCase()
        : raw.replace(/\D/g, '').slice(-10);
      await this.consume(endpoint + ':' + normalized, 5);
    }
    await this.prisma.$executeRaw`
      DELETE FROM "RateLimitWindow" WHERE "key" IN
      (SELECT "key" FROM "RateLimitWindow" WHERE "expiresAt" < NOW() - INTERVAL '1 hour' LIMIT 100)`;
    return true;
  }
}
