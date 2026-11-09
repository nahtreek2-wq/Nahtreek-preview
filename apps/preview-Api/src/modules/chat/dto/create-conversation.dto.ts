import { IsOptional, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsUUID()
  engineerRequestId?: string;

  @IsOptional()
  @IsUUID()
  serviceRequestId?: string;
}
