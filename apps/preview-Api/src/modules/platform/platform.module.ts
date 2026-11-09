import { Module } from "@nestjs/common";
import {
  HistoryController,
  PlatformDiscoveryController,
  ProfessionalsController,
  ServiceAdminController,
  ServiceRequestsController,
} from "./platform.controller";
import { PlatformService } from "./platform.service";
import {JourneyService} from './journey.service';
import {JourneyController, JourneyMaintenanceController} from './journey.controller';
import {NotificationsModule} from '../notifications/notifications.module';
import {RequestsModule} from '../requests/requests.module';
import {ChatModule} from '../chat/chat.module';
import {PaymentsModule} from '../payments/payments.module';

@Module({
  imports: [NotificationsModule, RequestsModule, ChatModule, PaymentsModule],
  controllers: [
    JourneyController,
    JourneyMaintenanceController,
    PlatformDiscoveryController,
    ProfessionalsController,
    ServiceRequestsController,
    HistoryController,
    ServiceAdminController,
  ],
  providers: [PlatformService, JourneyService],
})
export class PlatformModule {}
