export const PORTRAITS: Record<string, number> = {
  'eng-1': require('./portrait-eng-1.jpg'),
  'eng-2': require('./portrait-eng-2.jpg'),
  'eng-3': require('./portrait-eng-3.jpg'),
};

export const HERO_PHOTOS = {
  planning: require('./india/site-engineer-v2.jpg'),
  services: require('./india/home-services-hero-v2.jpg'),
  renovation: require('./india/home-renovation-v2.jpg'),
} as const;

export const WORK_PHOTOS: Record<string, number> = {
  plumbing: require('./india/plumbing-v2.jpg'),
  electrical: require('./india/electrical-v2.jpg'),
  painting: require('./india/painting-v2.jpg'),
  carpentry: require('./india/carpentry-v2.jpg'),
  renovation: require('./india/home-renovation-v2.jpg'),
  waterproofing: require('./india/waterproofing-v2.jpg'),
  maintenance: require('./india/home-maintenance-v2.jpg'),
  cleaning: require('./india/deep-cleaning-v2.jpg'),
  ac: require('./india/ac-service-v2.jpg'),
  masonry: require('./india/masonry-v2.jpg'),
  inspection: require('./india/property-inspection-v2.jpg'),
  structural: require('./india/home-inspection-v2.jpg'),
  design: require('./india/residential-design-v2.jpg'),
  supervision: require('./india/site-supervision-v2.jpg'),
};

export const SITE_PHOTO = HERO_PHOTOS.planning;

const PROFESSIONAL_SCENES = [
  HERO_PHOTOS.planning,
  WORK_PHOTOS.inspection,
  WORK_PHOTOS.masonry,
] as const;

export function workPhotoFor(slug?: string): number {
  return WORK_PHOTOS[slug ?? ''] ?? SITE_PHOTO;
}

export function portraitFor(id?: string): number | undefined {
  return PORTRAITS[id ?? ''];
}

export function professionalSceneFor(id?: string): number {
  const seed = [...(id ?? '')].reduce((total, char) => total + char.charCodeAt(0), 0);
  return PROFESSIONAL_SCENES[seed % PROFESSIONAL_SCENES.length];
}
