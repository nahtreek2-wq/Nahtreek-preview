ALTER TABLE "Conversation" ADD COLUMN "serviceRequestId" TEXT;

ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_serviceRequestId_fkey"
  FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Conversation_serviceRequestId_idx"
  ON "Conversation"("serviceRequestId");
