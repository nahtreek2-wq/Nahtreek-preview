import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  controllers: [RequestsController],
  imports: [ChatModule, NotificationsModule, PaymentsModule],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
