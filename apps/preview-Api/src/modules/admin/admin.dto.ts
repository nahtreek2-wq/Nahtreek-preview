import {
  AccountStatus,
  DocumentReviewStatus,
  VerificationStatus,
} from "@prisma/client";
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class AdminProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName: string;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  professionalTitle?: string;
}

export class ProfileReviewDto {
  @IsIn([
    VerificationStatus.UNDER_REVIEW,
    VerificationStatus.VERIFIED,
    VerificationStatus.REJECTED,
  ])
  status: "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason?: string;
}

export class DocumentReviewDto {
  @IsEnum(DocumentReviewStatus)
  @IsIn([DocumentReviewStatus.APPROVED, DocumentReviewStatus.REJECTED])
  status: "APPROVED" | "REJECTED";

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason?: string;
}

export class UserStatusDto {
  @IsIn([
    AccountStatus.ACTIVE,
    AccountStatus.SUSPENDED,
    AccountStatus.DEACTIVATED,
  ])
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason?: string;
}
