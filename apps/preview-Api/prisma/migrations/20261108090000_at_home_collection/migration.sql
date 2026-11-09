ALTER TYPE "PaymentStatus" ADD VALUE 'COLLECTED_UNSETTLED';
ALTER TYPE "PaymentStatus" ADD VALUE 'SETTLED';

ALTER TABLE "ServiceJourney" ADD COLUMN "collectionMode" TEXT NOT NULL DEFAULT 'ONLINE';
ALTER TABLE "ServiceJourney" ADD COLUMN "collectedAmountPaisa" INTEGER;
ALTER TABLE "ServiceJourney" ADD COLUMN "collectedMethod" TEXT;
ALTER TABLE "ServiceJourney" ADD COLUMN "collectedAt" TIMESTAMP(3);

ALTER TABLE "Payment" ADD COLUMN "collectionMode" TEXT NOT NULL DEFAULT 'ONLINE';
ALTER TABLE "Payment" ADD COLUMN "settledAt" TIMESTAMP(3);

ALTER TABLE "ProfessionalProfile" ADD COLUMN "reviewCode" TEXT;
CREATE UNIQUE INDEX "ProfessionalProfile_reviewCode_key" ON "ProfessionalProfile"("reviewCode");

CREATE TABLE "CommissionSettlement" (
  "id" TEXT NOT NULL,
  "professionalProfileId" TEXT NOT NULL,
  "paymentIds" TEXT[] NOT NULL,
  "amountPaisa" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'ORDER_CREATED',
  "providerOrderId" TEXT,
  "providerPaymentId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "settledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommissionSettlement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CommissionSettlement_providerOrderId_key" ON "CommissionSettlement"("providerOrderId");
CREATE UNIQUE INDEX "CommissionSettlement_providerPaymentId_key" ON "CommissionSettlement"("providerPaymentId");
CREATE UNIQUE INDEX "CommissionSettlement_idempotencyKey_key" ON "CommissionSettlement"("idempotencyKey");
CREATE INDEX "CommissionSettlement_professionalProfileId_status_idx" ON "CommissionSettlement"("professionalProfileId", "status");
ALTER TABLE "CommissionSettlement" ADD CONSTRAINT "CommissionSettlement_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
