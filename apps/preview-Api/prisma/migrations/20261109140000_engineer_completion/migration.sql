-- Engineer completion proof + transition GPS audit.
ALTER TABLE "EngineerRequest" ADD COLUMN "completionCode" TEXT;
ALTER TABLE "EngineerRequest" ADD COLUMN "completionCodeAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RequestStatusHistory" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "RequestStatusHistory" ADD COLUMN "longitude" DOUBLE PRECISION;
