CREATE TABLE "RateLimitWindow" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "RateLimitWindow_expiresAt_idx" ON "RateLimitWindow"("expiresAt");
ALTER TABLE "RateLimitWindow" ENABLE ROW LEVEL SECURITY;
