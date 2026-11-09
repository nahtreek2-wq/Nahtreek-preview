CREATE TYPE "AiConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "AiMessageType" AS ENUM ('USER_TEXT', 'AI_TEXT', 'SYSTEM', 'DOCUMENT', 'IMAGE', 'STRUCTURED_QUESTION', 'PROJECT_PLAN', 'SERVICE_RECOMMENDATION', 'PROFESSIONAL_RECOMMENDATION');
CREATE TYPE "AiDocumentStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED');
CREATE TABLE "AiConversation" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "title" TEXT NOT NULL, "projectType" TEXT, "city" TEXT,
 "status" "AiConversationStatus" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "AiMessage" (
 "id" TEXT PRIMARY KEY, "conversationId" TEXT NOT NULL, "type" "AiMessageType" NOT NULL, "content" TEXT NOT NULL,
 "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "AiProjectPlan" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "conversationId" TEXT NOT NULL, "projectType" TEXT NOT NULL,
 "title" TEXT NOT NULL, "summary" TEXT NOT NULL, "stages" JSONB NOT NULL, "recommendations" JSONB NOT NULL,
 "checklist" JSONB NOT NULL, "missingInformation" JSONB NOT NULL, "safetyNote" TEXT NOT NULL,
 "version" INTEGER NOT NULL DEFAULT 1, "archivedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "AiDocument" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "conversationId" TEXT, "fileName" TEXT NOT NULL,
 "mimeType" TEXT NOT NULL, "sizeBytes" INTEGER NOT NULL, "status" "AiDocumentStatus" NOT NULL DEFAULT 'UPLOADING',
 "storageUrl" TEXT, "extractedSummary" TEXT, "failureReason" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "AiConversation_userId_updatedAt_idx" ON "AiConversation"("userId", "updatedAt");
CREATE INDEX "AiMessage_conversationId_createdAt_idx" ON "AiMessage"("conversationId", "createdAt");
CREATE INDEX "AiProjectPlan_userId_updatedAt_idx" ON "AiProjectPlan"("userId", "updatedAt");
CREATE INDEX "AiProjectPlan_conversationId_version_idx" ON "AiProjectPlan"("conversationId", "version");
CREATE INDEX "AiDocument_userId_createdAt_idx" ON "AiDocument"("userId", "createdAt");
CREATE INDEX "AiDocument_conversationId_status_idx" ON "AiDocument"("conversationId", "status");
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiProjectPlan" ADD CONSTRAINT "AiProjectPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiProjectPlan" ADD CONSTRAINT "AiProjectPlan_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDocument" ADD CONSTRAINT "AiDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiDocument" ADD CONSTRAINT "AiDocument_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiProjectPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiDocument" ENABLE ROW LEVEL SECURITY;
