// Product Images Configuration
// This file maps product IDs to their image galleries

// Import concrete collection images
import altaSlabSample from './concrete/alta-slab-sample.jpg';
import textureClose from './concrete/texture-close.png';

// Import other collections (to be added)
// import fabricSample from './fabric/sample.jpg';
// import matteSample from './matte/sample.jpg';
// import marbleSample from './marble/sample.jpg';
// import accessorySample from './accessories/sample.jpg';

// Default/placeholder images for development
const defaultImages = [
  'https://images.unsplash.com/photo-1615971677499-5467cbab01e4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1615880484746-a3990926ab05?w=600&h=400&fit=crop'
];

// Product image galleries mapping
export const productImageMap: Record<string, string[]> = {
  // Concrete collection (Магия Бетона)
  '8934': [altaSlabSample, textureClose, ...defaultImages], // Закат
  '8938': [altaSlabSample, textureClose, ...defaultImages], // Закат большой
  '8930': [altaSlabSample, textureClose, ...defaultImages], // Метеорит
  '8931': [altaSlabSample, textureClose, ...defaultImages], // Метеорит большой
  '8936': [altaSlabSample, textureClose, ...defaultImages], // Комета
  
  // Add more mappings as images become available
  // '8937': [fabricSample, ...defaultImages], // Fabric collection
  // '8935': [matteSample, ...defaultImages], // Matte collection
  // etc.
};

// Helper function to get product gallery
export const getProductGallery = (productId: string): string[] => {
  return productImageMap[productId] || defaultImages;
};

// Collection-based fallback images
export const collectionImageMap: Record<string, string[]> = {
  'МАГИЯ БЕТОНА': [altaSlabSample, ...defaultImages],
  'ТКАНЕВАЯ РОСКОШЬ': defaultImages,
  'МАТОВАЯ ЭСТЕТИКА': defaultImages,
  'МРАМОРНАЯ ФЕЕРИЯ': defaultImages,
  'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ': defaultImages,
};

// Helper function to get collection-based gallery
export const getCollectionGallery = (collection: string): string[] => {
  return collectionImageMap[collection] || defaultImages;
};