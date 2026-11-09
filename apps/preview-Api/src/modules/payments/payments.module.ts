import {Module} from '@nestjs/common';
import {ChatModule} from '../chat/chat.module';
import {NotificationsModule} from '../notifications/notifications.module';
import {MembershipsModule} from '../memberships/memberships.module';
import {BillingProviderModule} from './billing-provider.module';
import {PaymentsController, PaymentsWebhookController} from './payments.controller';
import {PaymentsService} from './payments.service';

@Module({
  imports: [NotificationsModule, ChatModule, MembershipsModule, BillingProviderModule],
  controllers: [PaymentsController, PaymentsWebhookController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
