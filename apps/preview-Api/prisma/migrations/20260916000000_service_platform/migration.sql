ALTER TYPE "Role" ADD VALUE 'SERVICE_PROVIDER';
ALTER TABLE "ClientProfile" ADD COLUMN "address" TEXT;
ALTER TABLE "ProfessionalProfile" ADD COLUMN "serviceCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], ADD COLUMN "startingPrice" DOUBLE PRECISION;

CREATE TABLE "ServiceCategory" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL, "group" TEXT NOT NULL,
  "description" TEXT NOT NULL, "prepare" TEXT NOT NULL DEFAULT '', "iconName" TEXT NOT NULL DEFAULT 'hammer-wrench',
  "sortOrder" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");
CREATE TABLE "ServiceRequest" (
  "id" TEXT NOT NULL, "clientProfileId" TEXT NOT NULL, "professionalProfileId" TEXT NOT NULL, "serviceCategoryId" TEXT NOT NULL,
  "description" TEXT NOT NULL, "locationAddress" TEXT NOT NULL, "latitude" DOUBLE PRECISION NOT NULL, "longitude" DOUBLE PRECISION NOT NULL,
  "preferredStartDate" TIMESTAMP(3), "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ServiceRequest_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ServiceRequest_professionalProfileId_fkey" FOREIGN KEY ("professionalProfileId") REFERENCES "ProfessionalProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ServiceRequest_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "ServiceRequest_clientProfileId_createdAt_idx" ON "ServiceRequest"("clientProfileId", "createdAt");
CREATE INDEX "ServiceRequest_professionalProfileId_status_idx" ON "ServiceRequest"("professionalProfileId", "status");
CREATE TABLE "ServiceRequestStatusHistory" (
  "id" TEXT NOT NULL, "serviceRequestId" TEXT NOT NULL, "fromStatus" "RequestStatus", "toStatus" "RequestStatus" NOT NULL,
  "changedByUserId" TEXT NOT NULL, "reason" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceRequestStatusHistory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ServiceRequestStatusHistory_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ServiceRequestStatusHistory_serviceRequestId_createdAt_idx" ON "ServiceRequestStatusHistory"("serviceRequestId", "createdAt");
