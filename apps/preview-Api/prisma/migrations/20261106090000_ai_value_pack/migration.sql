-- AI value pack: stored cost ranges the AI is allowed to quote.
CREATE TABLE "AiRateCard" (
  "id" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "serviceKey" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "minPaisa" INTEGER NOT NULL,
  "maxPaisa" INTEGER NOT NULL,
  "unit" TEXT NOT NULL,
  "note" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiRateCard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiRateCard_city_serviceKey_key" ON "AiRateCard"("city", "serviceKey");
CREATE INDEX "AiRateCard_city_idx" ON "AiRateCard"("city");

-- Typical urban India ranges (conservative mid-market). Verified pros confirm final price on visit.
INSERT INTO "AiRateCard" ("id", "city", "serviceKey", "label", "minPaisa", "maxPaisa", "unit", "note") VALUES
(gen_random_uuid(), 'ALL', 'plumber-visit', 'Plumber home visit', 19900, 39900, 'visit', 'Diagnosis only; parts and labour extra'),
(gen_random_uuid(), 'ALL', 'tap-fitting', 'Tap or fitting replacement', 29900, 89900, 'fitting', 'Excluding branded fittings'),
(gen_random_uuid(), 'ALL', 'leak-repair', 'Leakage repair', 49900, 149900, 'job', 'Small pipe and bathroom leaks'),
(gen_random_uuid(), 'ALL', 'electrician-visit', 'Electrician home visit', 19900, 39900, 'visit', 'Diagnosis only; materials extra'),
(gen_random_uuid(), 'ALL', 'switchboard', 'Switchboard and wiring fix', 49900, 129900, 'point', 'Per point or small board'),
(gen_random_uuid(), 'ALL', 'fan-install', 'Ceiling fan installation', 39900, 79900, 'fan', 'Excluding the fan unit'),
(gen_random_uuid(), 'ALL', 'ac-service', 'AC general service', 49900, 79900, 'unit', 'Split or window, per indoor unit'),
(gen_random_uuid(), 'ALL', 'ac-deep-service', 'AC deep foam service', 99900, 179900, 'unit', 'With drain tray and filter care'),
(gen_random_uuid(), 'ALL', 'ac-install', 'AC installation', 149900, 249900, 'unit', 'Standard install with bracket'),
(gen_random_uuid(), 'ALL', 'clean-1bhk', 'Full home deep cleaning 1BHK', 249900, 399900, 'home', 'Kitchen and bathrooms included'),
(gen_random_uuid(), 'ALL', 'clean-2bhk', 'Full home deep cleaning 2BHK', 349900, 549900, 'home', 'Kitchen and bathrooms included'),
(gen_random_uuid(), 'ALL', 'clean-3bhk', 'Full home deep cleaning 3BHK', 499900, 799900, 'home', 'Kitchen and bathrooms included'),
(gen_random_uuid(), 'ALL', 'paint-repaint', 'Wall repainting', 1800, 4500, 'sqft', 'Putty and primer extra for damaged walls'),
(gen_random_uuid(), 'ALL', 'paint-fresh', 'Fresh painting new walls', 2500, 6000, 'sqft', 'With putty, primer and two coats'),
(gen_random_uuid(), 'ALL', 'carpenter-day', 'Carpenter day work', 80000, 120000, 'day', 'Small repairs and fittings'),
(gen_random_uuid(), 'ALL', 'pest-1bhk', 'Pest control 1BHK', 99900, 179900, 'home', 'Cockroach and ant treatment'),
(gen_random_uuid(), 'ALL', 'appliance-visit', 'Appliance repair visit', 29900, 49900, 'visit', 'Spare parts extra'),
(gen_random_uuid(), 'ALL', 'false-ceiling', 'False ceiling', 7500, 14000, 'sqft', 'Gypsum; design and lighting extra'),
(gen_random_uuid(), 'ALL', 'waterproofing', 'Terrace and bathroom waterproofing', 4000, 9000, 'sqft', 'Chemical coating systems'),
(gen_random_uuid(), 'ALL', 'purifier-service', 'Water purifier service', 49900, 89900, 'visit', 'Filters and membrane extra');
