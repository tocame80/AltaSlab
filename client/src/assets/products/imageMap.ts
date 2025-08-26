// Product Images Configuration
// Naming convention: {productCode}-{number}.{extension}
// Example: 8934-1.jpg, 8934-2.png, etc.

// Import placeholder image (used when no specific product images available)
import placeholderImage from './placeholder.jpg';

// Import specific product images for products that have them  
import zakkat8934_1 from './concrete/8934-1.png';

import zakkat8938_1 from './concrete/8938-1.jpg';

import product8934_1 from './concrete/8934-1.png';
import product8934_2 from './concrete/8934-2.png';
import product8934_3 from './concrete/8934-3.png';

// Map collection names to folder paths
const getCollectionFolder = (collection: string): string => {
  const folderMap: Record<string, string> = {
    'МАГИЯ БЕТОНА': 'concrete',
    'ТКАНЕВАЯ РОСКОШЬ': 'fabric',
    'МАТОВАЯ ЭСТЕТИКА': 'matte', 
    'МРАМОРНАЯ ФЕЕРИЯ': 'marble',
    'КЛЕЙ И ПРОФИЛЯ ДЛЯ ПАНЕЛЕЙ АЛЬТА СЛЭБ': 'accessories'
  };
  return folderMap[collection] || 'concrete';
};

// Product-specific image mapping (manually add products that have real photos)
const specificImageMap: Record<string, string[]> = {
  '8934': [product8934_1, product8934_2, product8934_3], // Закат 300x600 - has one real photo
  '8938': [zakkat8938_1], // Закат 600x1200  
  // Add more products here as their photos become available:
  // '8930': [import('./concrete/8930-1.jpg'), import('./concrete/8930-2.jpg')], // Метеорит 300x600
};

// Helper function to get product gallery
export const getProductGallery = (productId: string, collection: string = ''): string[] => {
  // Check if we have specific images mapped for this product
  if (specificImageMap[productId]) {
    return specificImageMap[productId];
  }
  
  // If no specific product images available, use single placeholder
  return [placeholderImage];
};

// Function to get main image for catalog display
export const getProductMainImage = (productId: string, collection: string = ''): string => {
  // Check if we have specific images mapped for this product
  if (specificImageMap[productId] && specificImageMap[productId].length > 0) {
    return specificImageMap[productId][0]; // Return first image
  }
  
  // If no specific product images available, use placeholder
  return placeholderImage;
};

