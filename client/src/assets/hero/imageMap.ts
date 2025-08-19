// Hero Images Map
// Import hero images here as they are added

// Default/placeholder hero image
import placeholderHero from './placeholder-hero.jpg';

// Actual hero images
import hero1 from './hero-1.jpg';

export interface HeroImageData {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

// Default hero image data
const defaultHeroImage: HeroImageData = {
  id: 'default-hero',
  title: 'АЛЬТА СЛЭБ - Панели стеновые и потолочные SPC',
  imageUrl: placeholderHero,
  isActive: true,
  sortOrder: 0
};

// Hero images array - add new images here
export const heroImages: HeroImageData[] = [
  defaultHeroImage,
  {
    id: 'hero-1',
    title: 'Современный выставочный зал АЛЬТА СЛЭБ',
    imageUrl: hero1,
    isActive: true,
    sortOrder: 1
  },
];

// Get all active hero images, sorted by sortOrder
export const getActiveHeroImages = (): HeroImageData[] => {
  return heroImages
    .filter(image => image.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// Get hero image by ID
export const getHeroImageById = (id: string): HeroImageData | undefined => {
  return heroImages.find(image => image.id === id);
};