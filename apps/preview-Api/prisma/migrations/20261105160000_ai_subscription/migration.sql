-- CreateTable
CREATE TABLE "AiSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "providerSubscriptionId" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'NONE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "lastChargeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSubscriptionEvent" (
    "id" TEXT NOT NULL,
    "aiSubscriptionId" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSubscriptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiSubscription_userId_key" ON "AiSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AiSubscription_providerSubscriptionId_key" ON "AiSubscription"("providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "AiSubscriptionEvent_providerEventId_key" ON "AiSubscriptionEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "AiSubscriptionEvent_aiSubscriptionId_createdAt_idx" ON "AiSubscriptionEvent"("aiSubscriptionId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiSubscription" ADD CONSTRAINT "AiSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSubscriptionEvent" ADD CONSTRAINT "AiSubscriptionEvent_aiSubscriptionId_fkey" FOREIGN KEY ("aiSubscriptionId") REFERENCES "AiSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
