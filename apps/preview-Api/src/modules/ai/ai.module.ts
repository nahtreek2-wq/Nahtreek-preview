import {Module} from '@nestjs/common';
import {MembershipsModule} from '../memberships/memberships.module';
import {RequestsModule} from '../requests/requests.module';
import {AiController} from './ai.controller';
import {AiService} from './ai.service';

@Module({imports: [MembershipsModule, RequestsModule], controllers: [AiController], providers: [AiService]})
export class AiModule {}
