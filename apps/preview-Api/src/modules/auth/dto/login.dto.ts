import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEmail,
  Matches,
} from "class-validator";

export class LoginDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d[\d\s-]{8,14}$/)
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
