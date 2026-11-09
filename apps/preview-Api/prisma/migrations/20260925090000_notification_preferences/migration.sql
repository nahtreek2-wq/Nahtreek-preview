CREATE TABLE "NotificationPreference" (
  "userId" TEXT NOT NULL PRIMARY KEY,
  "requestUpdates" BOOLEAN NOT NULL DEFAULT true,
  "messages" BOOLEAN NOT NULL DEFAULT true,
  "offers" BOOLEAN NOT NULL DEFAULT false,
  "lastTipAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE "NotificationPreference" ENABLE ROW LEVEL SECURITY;
