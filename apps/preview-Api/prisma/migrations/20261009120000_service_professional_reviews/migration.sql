ALTER TABLE "Review" ADD COLUMN "serviceRequestId" TEXT;

CREATE UNIQUE INDEX "Review_serviceRequestId_key" ON "Review"("serviceRequestId");

ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceRequestId_fkey"
  FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
