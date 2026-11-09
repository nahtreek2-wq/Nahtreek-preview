CREATE TYPE "DocumentReviewStatus" AS ENUM ('UPLOADED', 'APPROVED', 'REJECTED');
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_STARTED', 'ORDER_CREATED', 'PAID', 'HELD', 'RELEASE_PENDING', 'RELEASED', 'REFUND_PENDING', 'REFUNDED', 'FAILED', 'DISPUTED');
CREATE TYPE "PayoutAccountStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');

ALTER TABLE "VerificationDocument" ADD COLUMN "status" "DocumentReviewStatus" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedByUserId" TEXT;

-- Preserve existing approvals before retiring the legacy flag.
UPDATE "VerificationDocument" SET "status" = 'APPROVED' WHERE "isVerified" = true;
ALTER TABLE "VerificationDocument" DROP COLUMN "isVerified";

CREATE TABLE "PayoutAccount" (
  "id" TEXT NOT NULL,
  "professionalProfileId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountRef" TEXT,
  "accountHolderName" TEXT NOT NULL,
  "bankName" TEXT,
  "accountLast4" TEXT,
  "status" "PayoutAccountStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayoutAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "professionalProfileId" TEXT NOT NULL,
  "engineerRequestId" TEXT,
  "serviceRequestId" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'RAZORPAY_ROUTE',
  "providerOrderId" TEXT,
  "providerPaymentId" TEXT,
  "providerTransferId" TEXT,
  "amountPaisa" INTEGER NOT NULL,
  "platformFeePaisa" INTEGER NOT NULL,
  "professionalAmountPaisa" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "PaymentStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "idempotencyKey" TEXT NOT NULL,
  "paidAt" TIMESTAMP(3),
  "releaseRequestedAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PayoutAccount_professionalProfileId_key" ON "PayoutAccount"("professionalProfileId");
CREATE UNIQUE INDEX "PayoutAccount_providerAccountRef_key" ON "PayoutAccount"("providerAccountRef");
CREATE UNIQUE INDEX "Payment_engineerRequestId_key" ON "Payment"("engineerRequestId");
CREATE UNIQUE INDEX "Payment_serviceRequestId_key" ON "Payment"("serviceRequestId");
CREATE UNIQUE INDEX "Payment_providerOrderId_key" ON "Payment"("providerOrderId");
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
CREATE UNIQUE INDEX "Payment_providerTransferId_key" ON "Payment"("providerTransferId");
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
CREATE INDEX "Payment_professionalProfileId_status_createdAt_idx" ON "Payment"("professionalProfileId", "status", "createdAt");
CREATE UNIQUE INDEX "PaymentEvent_providerEventId_key" ON "PaymentEvent"("providerEventId");
CREATE INDEX "PaymentEvent_paymentId_createdAt_idx" ON "PaymentEvent"("paymentId", "createdAt");
CREATE INDEX "VerificationDocument_professionalProfileId_documentType_idx" ON "VerificationDocument"("professionalProfileId", "documentType");

ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PayoutAccount" ADD CONSTRAINT "PayoutAccount_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_engineerRequestId_fkey" FOREIGN KEY ("engineerRequestId") REFERENCES "EngineerRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_single_request_check" CHECK (("engineerRequestId" IS NOT NULL)::int + ("serviceRequestId" IS NOT NULL)::int = 1);
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amounts_check" CHECK ("amountPaisa" > 0 AND "platformFeePaisa" >= 0 AND "professionalAmountPaisa" >= 0 AND "platformFeePaisa" + "professionalAmountPaisa" = "amountPaisa");
