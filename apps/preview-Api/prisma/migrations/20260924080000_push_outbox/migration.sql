ALTER TABLE "Notification" ADD COLUMN "pushState" TEXT NOT NULL DEFAULT 'SKIPPED',
  ADD COLUMN "pushAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "pushAfter" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "pushLeaseUntil" TIMESTAMP(3);
-- Existing in-app history must not become a flood of old push alerts.
ALTER TABLE "Notification" ALTER COLUMN "pushState" SET DEFAULT 'PENDING';
CREATE INDEX "Notification_pushState_pushAfter_idx" ON "Notification"("pushState", "pushAfter");
CREATE TABLE "PushDevice" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "app" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PushDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PushDevice_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PushDevice_token_key" ON "PushDevice"("token");
CREATE INDEX "PushDevice_userId_idx" ON "PushDevice"("userId");
CREATE UNIQUE INDEX "PushDevice_sessionId_app_key" ON "PushDevice"("sessionId", "app");
ALTER TABLE "PushDevice" ENABLE ROW LEVEL SECURITY;
