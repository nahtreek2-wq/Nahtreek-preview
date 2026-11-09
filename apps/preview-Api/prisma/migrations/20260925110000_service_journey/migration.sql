CREATE TABLE "ProviderPresence" (
 "professionalProfileId" TEXT PRIMARY KEY REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE,
 "online" BOOLEAN NOT NULL DEFAULT false, "latitude" DOUBLE PRECISION NOT NULL,
 "longitude" DOUBLE PRECISION NOT NULL, "accuracy" DOUBLE PRECISION NOT NULL,
 "observedAt" TIMESTAMP(3) NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL,
 "radiusKm" DOUBLE PRECISION NOT NULL DEFAULT 10
);
CREATE TABLE "ServiceJourney" (
 "requestId" TEXT PRIMARY KEY REFERENCES "ServiceRequest"("id") ON DELETE CASCADE,
 "idempotencyKey" TEXT NOT NULL UNIQUE, "payloadHash" TEXT NOT NULL,
 "mode" TEXT NOT NULL, "stage" TEXT NOT NULL DEFAULT 'PENDING',
 "recipientName" TEXT NOT NULL, "recipientPhone" TEXT NOT NULL,
 "scheduledAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3) NOT NULL,
 "etaMinutes" INTEGER, "arrivalTarget" TIMESTAMP(3),
 "quoteAmount" DOUBLE PRECISION, "quoteScope" TEXT, "quoteAccepted" BOOLEAN NOT NULL DEFAULT false,
 "startCode" TEXT, "codeAttempts" INTEGER NOT NULL DEFAULT 0,
 "completionSummary" TEXT, "issue" TEXT, "revision" INTEGER NOT NULL DEFAULT 1,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "ServiceJourney_stage_expiresAt_idx" ON "ServiceJourney"("stage", "expiresAt");
ALTER TABLE "ProviderPresence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceJourney" ENABLE ROW LEVEL SECURITY;
