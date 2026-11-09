import { Type } from "class-transformer";
import {
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateClientProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
  @IsOptional() @IsString() @Matches(/^\d{6}$/)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(https:\/\/|\/uploads\/avatars\/)/)
  @MaxLength(2000)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;
}

export class UploadPhotoDto {
  @IsString()
  @Matches(/^(image\/jpeg|image\/png|image\/webp)$/)
  mimeType: string;
  @IsString()
  @MinLength(16)
  @MaxLength(1500000)
  @Matches(/^[A-Za-z0-9+/]+={0,2}$/)
  contentBase64: string;
}
