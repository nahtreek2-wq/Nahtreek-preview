// Editorial service guidance, not claims about provider availability or pricing.
export const SERVICE_GUIDES = [
  {id: 'structural', title: 'Structural consultation', group: 'Engineering & Structural', search: 'Structural', description: 'Discuss structural safety, design questions and proposed changes with a qualified engineer.', prepare: 'Property type, building age, drawings if available, and the specific concern.'},
  {id: 'design', title: 'Residential design', group: 'Engineering & Structural', search: 'Design', description: 'Plan the layout and engineering requirements for a new home or extension.', prepare: 'Plot dimensions, intended rooms, site location and budget range.'},
  {id: 'supervision', title: 'Site supervision', group: 'Construction & Renovation', search: 'Supervision', description: 'Discuss site visits and construction checks at agreed project stages.', prepare: 'Construction stage, site address, drawings and preferred visit date.'},
  {id: 'renovation', title: 'Renovation', group: 'Construction & Renovation', search: 'Renovation', description: 'Assess changes to an existing property and the professionals needed.', prepare: 'Existing condition, planned changes, dimensions and access arrangements.'},
  {id: 'plumbing', title: 'Plumbing', group: 'Home Services', search: 'Plumbing', description: 'Find help with water supply, drainage, leaks and plumbing installation.', prepare: 'Where the issue occurs, how long it has happened and access to the affected area.'},
  {id: 'electrical', title: 'Electrical', group: 'Home Services', search: 'Electrical', description: 'Find a professional for wiring, fittings and electrical maintenance.', prepare: 'Affected rooms or equipment and the work required. Avoid touching exposed wiring.'},
  {id: 'painting', title: 'Painting', group: 'Home Services', search: 'Painting', description: 'Plan interior or exterior surface preparation and painting.', prepare: 'Approximate area, surface condition and preferred finish.'},
  {id: 'carpentry', title: 'Carpentry', group: 'Home Services', search: 'Carpentry', description: 'Discuss furniture, doors, fittings and woodwork repairs.', prepare: 'Dimensions, material preferences and the repair or installation required.'},
  {id: 'masonry', title: 'Masonry', group: 'Construction & Renovation', search: 'Masonry', description: 'Discuss brickwork, plastering and related construction needs.', prepare: 'Work dimensions, site condition and intended use.'},
  {id: 'waterproofing', title: 'Waterproofing', group: 'Inspection & Maintenance', search: 'Waterproofing', description: 'Assess dampness or water ingress and suitable remedial work.', prepare: 'Affected area, leak timing and previous repairs.'},
  {id: 'inspection', title: 'Property inspection', group: 'Inspection & Maintenance', search: 'Inspection', description: 'Arrange an assessment of a property’s visible condition and concerns.', prepare: 'Property age, size, available records and areas of concern.'},
  {id: 'maintenance', title: 'Maintenance', group: 'Inspection & Maintenance', search: 'Maintenance', description: 'Discuss planned repairs and upkeep with relevant professionals.', prepare: 'A list of issues, priority, location and access details.'},
] as const;

export const SERVICE_GROUPS = ['Home Services', 'Construction & Renovation', 'Inspection & Maintenance', 'Engineering & Structural'];
export const ORDERED_SERVICE_GUIDES = SERVICE_GROUPS.flatMap(group => SERVICE_GUIDES.filter(service => service.group === group));
