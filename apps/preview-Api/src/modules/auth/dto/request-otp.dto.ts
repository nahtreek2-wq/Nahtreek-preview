import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d[\d\s-]{8,14}$/, {
    message: "phoneNumber must be a valid Indian mobile number",
  })
  phoneNumber: string;
}

export class EmailOtpRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;
}
