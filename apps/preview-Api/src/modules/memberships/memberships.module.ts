import {Module} from '@nestjs/common';
import {ChatModule} from '../chat/chat.module';
import {NotificationsModule} from '../notifications/notifications.module';
import {BillingProviderModule} from '../payments/billing-provider.module';
import {AiBillingController, MembershipsController, MembershipsInternalController} from './memberships.controller';
import {MembershipsService} from './memberships.service';

@Module({
  imports: [NotificationsModule, ChatModule, BillingProviderModule],
  controllers: [AiBillingController, MembershipsController, MembershipsInternalController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
