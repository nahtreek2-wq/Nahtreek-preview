ALTER TABLE "Session" ADD COLUMN "previousRefreshTokenHash" TEXT;
ALTER TABLE "Session" ADD COLUMN "previousRotatedAt" TIMESTAMP(3);
