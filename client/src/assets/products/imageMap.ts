// Product Images Configuration
// Naming convention: {productCode}-{number}.{extension}
// Example: 8934-1.jpg, 8934-2.png, etc.

// Import existing sample images
import altaSlabSample from './concrete/alta-slab-sample.jpg';
import textureClose from './concrete/texture-close.png';

// Import placeholder image (used when no specific product images available)
import placeholderImage from './placeholder.jpg';

// Import specific product images  
import zakkat8934_1 from './concrete/8934-1.jpg';
import zakkat8934_2 from './concrete/8934-2.jpg';  
import zakkat8934_3 from './concrete/8934-3.png';

// Product-specific image mapping (add as images become available)
const specificImageMap: Record<string, string[]> = {
  '8934': [zakkat8934_1, zakkat8934_2, zakkat8934_3], // Закат 300x600
  // Add more products as their images become available:
  // '8938': [import('./concrete/8938-1.jpg'), import('./concrete/8938-2.jpg')], // Закат 600x1200  
  // '8930': [import('./matte/8930-1.jpg'), import('./matte/8930-2.jpg')], // Метеорит 300x600
};

// Helper function to get product gallery
export const getProductGallery = (productId: string, collection: string = ''): string[] => {
  // First check if we have specific images mapped
  if (specificImageMap[productId]) {
    return specificImageMap[productId];
  }
  
  // If no specific images available, use placeholder
  return [placeholderImage, placeholderImage, placeholderImage];
};

