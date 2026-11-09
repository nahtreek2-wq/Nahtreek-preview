-- Plus speed-SLA penalties against professionals.
CREATE TABLE "ProfessionalPenalty" (
  "id" TEXT NOT NULL,
  "professionalProfileId" TEXT NOT NULL,
  "serviceRequestId" TEXT NOT NULL,
  "amountPaisa" INTEGER NOT NULL,
  "reason" TEXT NOT NULL DEFAULT 'LATE_ARRIVAL',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "settledAt" TIMESTAMP(3),
  CONSTRAINT "ProfessionalPenalty_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProfessionalPenalty_serviceRequestId_reason_key" ON "ProfessionalPenalty"("serviceRequestId", "reason");
CREATE INDEX "ProfessionalPenalty_professionalProfileId_status_idx" ON "ProfessionalPenalty"("professionalProfileId", "status");
ALTER TABLE "ProfessionalPenalty" ADD CONSTRAINT "ProfessionalPenalty_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalPenalty" ADD CONSTRAINT "ProfessionalPenalty_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
