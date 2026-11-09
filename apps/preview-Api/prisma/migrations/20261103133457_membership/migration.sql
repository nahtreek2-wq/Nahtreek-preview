-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('NONE', 'PENDING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "ProviderPresence" DROP CONSTRAINT "ProviderPresence_professionalProfileId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceJourney" DROP CONSTRAINT "ServiceJourney_requestId_fkey";

-- AlterTable
ALTER TABLE "NotificationPreference" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OtpChallenge" ALTER COLUMN "deliveryChannel" DROP DEFAULT,
ALTER COLUMN "purpose" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "memberPriority" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "professionalProfileId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "providerSubscriptionId" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'NONE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "lastChargeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipEvent" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_professionalProfileId_key" ON "Membership"("professionalProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_providerSubscriptionId_key" ON "Membership"("providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipEvent_providerEventId_key" ON "MembershipEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "MembershipEvent_membershipId_createdAt_idx" ON "MembershipEvent"("membershipId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProviderPresence" ADD CONSTRAINT "ProviderPresence_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceJourney" ADD CONSTRAINT "ServiceJourney_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipEvent" ADD CONSTRAINT "MembershipEvent_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
