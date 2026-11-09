ALTER TABLE "ProfessionalProfile" ADD COLUMN "baseCityNorm" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProfessionalProfile" ADD COLUMN "baseStateNorm" TEXT NOT NULL DEFAULT '';
UPDATE "ProfessionalProfile" SET "baseCityNorm" = regexp_replace(lower("baseCity"), '[^a-z0-9]', '', 'g');
UPDATE "ProfessionalProfile" SET "baseStateNorm" = regexp_replace(lower("baseState"), '[^a-z0-9]', '', 'g');
CREATE INDEX "ProfessionalProfile_baseCityNorm_idx" ON "ProfessionalProfile"("baseCityNorm");
CREATE INDEX "ProfessionalProfile_baseStateNorm_idx" ON "ProfessionalProfile"("baseStateNorm");
