-- OTP challenges are short-lived. Generalise their key so Preview can use
-- verified email while Production continues to use verified mobile numbers.
ALTER TABLE "OtpChallenge" RENAME COLUMN "phoneNumber" TO "identifier";
ALTER TABLE "OtpChallenge" ADD COLUMN "deliveryChannel" TEXT NOT NULL DEFAULT 'SMS';
ALTER TABLE "OtpChallenge" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'SIGNUP';

