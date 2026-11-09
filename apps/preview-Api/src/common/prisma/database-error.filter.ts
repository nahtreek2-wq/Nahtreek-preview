import {ArgumentsHost, Catch, ExceptionFilter, Logger} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import type {Response} from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientInitializationError)
export class DatabaseErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseErrorFilter.name);
  catch(error: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientInitializationError, host: ArgumentsHost) {
    const code = 'code' in error ? error.code : error.errorCode;
    const temporary = ['P1001', 'P1002', 'P1008', 'P1017', 'P2024', 'P2028'].includes(code ?? '');
    // Never log connection strings, query arguments, passwords, or provider error bodies.
    this.logger.error(`Database request failed: ${code ?? 'initialization'}`);
    const response = host.switchToHttp().getResponse<Response>();
    response.status(temporary ? 503 : 500).json({
      statusCode: temporary ? 503 : 500,
      message: temporary
        ? 'The service is temporarily unavailable. Check the current status before repeating an action.'
        : 'We could not complete this action. Please try again later.',
    });
  }
}
