INSERT INTO "ServiceCategory" ("id", "slug", "title", "group", "description", "prepare", "iconName", "sortOrder", "isActive") VALUES
('service-plumbing', 'plumbing', 'Plumbing', 'Home Services', 'Water supply, drainage, leaks and plumbing installation.', 'Where the issue occurs, how long it has happened and access to the affected area.', 'pipe-wrench', 10, true),
('service-electrical', 'electrical', 'Electrical', 'Home Services', 'Wiring, fittings and electrical maintenance.', 'Affected rooms or equipment and the work required. Avoid touching exposed wiring.', 'lightning-bolt', 20, true),
('service-painting', 'painting', 'Painting', 'Home Services', 'Interior and exterior surface preparation and painting.', 'Approximate area, surface condition and preferred finish.', 'format-paint', 30, true),
('service-carpentry', 'carpentry', 'Carpentry', 'Home Services', 'Furniture, doors, fittings and woodwork repairs.', 'Dimensions, material preferences and the repair or installation required.', 'hammer', 40, true),
('service-supervision', 'supervision', 'Site supervision', 'Construction & Renovation', 'Site visits and construction checks at agreed project stages.', 'Construction stage, site address, drawings and preferred visit date.', 'clipboard-check', 50, true),
('service-renovation', 'renovation', 'Renovation', 'Construction & Renovation', 'Changes to an existing property and the professionals needed.', 'Existing condition, planned changes, dimensions and access arrangements.', 'home-edit', 60, true),
('service-masonry', 'masonry', 'Masonry', 'Construction & Renovation', 'Brickwork, plastering and related construction needs.', 'Work dimensions, site condition and intended use.', 'wall', 70, true),
('service-waterproofing', 'waterproofing', 'Waterproofing', 'Inspection & Maintenance', 'Assessment of dampness or water ingress and suitable remedial work.', 'Affected area, leak timing and previous repairs.', 'water-check', 80, true),
('service-inspection', 'inspection', 'Property inspection', 'Inspection & Maintenance', 'Assessment of a property’s visible condition and concerns.', 'Property age, size, available records and areas of concern.', 'home-search', 90, true),
('service-maintenance', 'maintenance', 'Maintenance', 'Inspection & Maintenance', 'Planned repairs and property upkeep.', 'A list of issues, priority, location and access details.', 'tools', 100, true),
('service-structural', 'structural', 'Structural consultation', 'Engineering & Structural', 'Structural safety, design questions and proposed property changes.', 'Property type, building age, drawings if available, and the specific concern.', 'office-building-cog', 110, true),
('service-design', 'design', 'Residential design', 'Engineering & Structural', 'Layout and engineering requirements for a new home or extension.', 'Plot dimensions, intended rooms, site location and budget range.', 'floor-plan', 120, true)
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title", "group" = EXCLUDED."group", "description" = EXCLUDED."description",
  "prepare" = EXCLUDED."prepare", "iconName" = EXCLUDED."iconName", "sortOrder" = EXCLUDED."sortOrder", "isActive" = true;

INSERT INTO "Specialization" ("id", "name", "slug", "description") VALUES
('10000000-0000-4000-8000-000000000001', 'Structural Design', 'structural-design', 'Structural planning, design review and safety guidance.'),
('10000000-0000-4000-8000-000000000002', 'Architectural 3D', 'architectural-3d', 'Three-dimensional architectural planning and visualisation.'),
('10000000-0000-4000-8000-000000000003', 'Site Plan Approval', 'site-plan-approval', 'Site planning and approval-document guidance.'),
('10000000-0000-4000-8000-000000000004', 'Geotechnical', 'geotechnical', 'Soil, foundation and site-condition guidance.'),
('10000000-0000-4000-8000-000000000005', 'Renovation Audit', 'renovation-audit', 'Technical review before property renovation work.')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description";
