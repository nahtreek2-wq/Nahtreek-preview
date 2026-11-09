import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {FcmProvider} from './fcm.provider';
import {EmailProvider} from './email.provider';
import {SmtpEmailProvider} from './smtp-email.provider';
import {ReceiptEmailService} from './receipt-email.service';
import {PushService} from './push.service';
import {PushDevicesController, PushDispatchController} from './push.controller';

@Module({
  controllers: [NotificationsController, PushDevicesController, PushDispatchController],
  providers: [NotificationsService, PushService, FcmProvider, EmailProvider, SmtpEmailProvider, ReceiptEmailService],
  exports: [NotificationsService, PushService, EmailProvider, SmtpEmailProvider, ReceiptEmailService],
})
export class NotificationsModule {}
