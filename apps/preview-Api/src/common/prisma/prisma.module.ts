import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {APP_FILTER} from '@nestjs/core';
import {DatabaseErrorFilter} from './database-error.filter';

@Global()
@Module({
  providers: [PrismaService, {provide: APP_FILTER, useClass: DatabaseErrorFilter}],
  exports: [PrismaService],
})
export class PrismaModule {}
