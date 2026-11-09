-- AC Service and Cleaning categories for the Home app tiles and NAHTREEK AI
-- service recommendations. Slugs match the app CATEGORY_SERVICE_IDS map.
INSERT INTO "ServiceCategory" ("id", "slug", "title", "group", "description", "prepare", "iconName", "sortOrder", "isActive") VALUES
('service-ac', 'ac', 'AC Service', 'Home Services', 'AC servicing, repair, gas refill and installation.', 'AC type (split or window), issue symptoms and indoor unit access.', 'air-conditioner', 25, true),
('service-cleaning', 'cleaning', 'Home Cleaning', 'Home Services', 'Full home deep cleaning, kitchen, bathroom and sofa care.', 'Home size in BHK, rooms to include and water availability.', 'spray-bottle', 26, true),
('service-pest-control', 'pest-control', 'Pest Control', 'Home Services', 'Treatment for cockroaches, termites, rodents and mosquitoes.', 'Pest type, affected rooms and whether children or pets are at home.', 'bug-spray', 27, true),
('service-appliance', 'appliance', 'Appliance Repair', 'Home Services', 'Diagnosis and repair of fridges, washing machines, chimneys, geysers and more.', 'Appliance brand and model, fault symptoms and purchase year if known.', 'washing-machine', 28, true)
ON CONFLICT ("id") DO NOTHING;
