import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsOptional, IsString, Length } from 'class-validator';
import { TransitionDto } from '../../platform/platform.dto';

// Engineer status transitions. COMPLETED additionally requires the 6-digit
// completion code shown to the client (proof the engineer finished the work
// with the client's knowledge). GPS is captured as an audit trail.
export class EngineerTransitionDto extends TransitionDto {
  @IsOptional()
  @IsString()
  @Length(6, 6)
  code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;
}
