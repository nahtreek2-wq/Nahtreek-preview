import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {runtimeDatabaseUrl} from './connection';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      ...(process.env.DATABASE_URL ? {datasources: {db: {url: runtimeDatabaseUrl(process.env.DATABASE_URL, process.env.VERCEL === '1' || process.env.DATABASE_POOL_MODE === 'transaction')}}} : {}),
      transactionOptions: {maxWait: 5000, timeout: 15000},
    });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.once('beforeExit', () => {
      void app.close();
    });
  }
}
