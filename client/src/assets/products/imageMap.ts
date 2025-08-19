// Product Images Configuration
// Naming convention: {productCode}-{number}.{extension}
// Example: 8934-1.jpg, 8934-2.png, etc.

// Import existing sample images
import altaSlabSample from './concrete/alta-slab-sample.jpg';
import textureClose from './concrete/texture-close.png';

// Default fallback images
const defaultImages = [
  'https://images.unsplash.com/photo-1615971677499-5467cbab01e4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1615880484746-a3990926ab05?w=600&h=400&fit=crop'
];

// Helper function to generate product image paths
const generateImagePaths = (productId: string, collection: string): string[] => {
  const collectionFolder = getCollectionFolder(collection);
  const imagePaths: string[] = [];
  
  // Generate paths for numbered images: productId-1.jpg, productId-2.jpg, etc.
  for (let i = 1; i <= 4; i++) {
    imagePaths.push(`${collectionFolder}/${productId}-${i}.jpg`);
  }
  
  return imagePaths;
};

// Map collection names to folder paths  
const getCollectionFolder = (collection: string): string => {
  const folderMap: Record<string, string> = {
    'МАГИЯ БЕТОНА': '/src/assets/products/concrete',
    'ТКАНЕВАЯ РОСКОШЬ': '/src/assets/products/fabric',
    'МАТОВАЯ ЭСТЕТИКА': '/src/assets/products/matte', 
    'МРАМОРНАЯ ФЕЕРИЯ': '/src/assets/products/marble',
    'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ': '/src/assets/products/accessories'
  };
  return folderMap[collection] || '/src/assets/products/concrete';
};

// Import specific product images
import zakkat8934_1 from './concrete/8934-1.jpg';
import zakkat8934_2 from './concrete/8934-2.jpg';

// Product-specific image mapping (add as images become available)
const specificImageMap: Record<string, string[]> = {
  '8934': [zakkat8934_1, zakkat8934_2, ...defaultImages], // Закат 300x600
  // '8938': ['8938-1.jpg', '8938-2.jpg'], // Закат 600x1200  
  // '8930': ['8930-1.jpg', '8930-2.jpg', '8930-3.jpg'], // Метеорит 300x600
  // etc.
};

// Helper function to get product gallery
export const getProductGallery = (productId: string, collection: string = ''): string[] => {
  // First check if we have specific images mapped
  if (specificImageMap[productId]) {
    return specificImageMap[productId];
  }
  
  // For now, use sample images until real photos are uploaded
  return [altaSlabSample, textureClose, ...defaultImages];
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