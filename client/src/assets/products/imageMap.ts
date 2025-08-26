// Product Images Configuration
// Dynamic image discovery system - automatically finds images for all products
// Supports multiple naming patterns: 8934-1.jpg, 8933 (1).png, etc.

// Import placeholder image (used when no specific product images available)
import placeholderImage from './placeholder.jpg';

// Static imports for known products (kept for immediate availability)

// Import product 8934 images from МагияБетонаЗАКАТ collection
import product8934_1 from './concrete/МагияБетонаЗАКАТ/PNG/8934 (1).png';
import product8934_2 from './concrete/МагияБетонаЗАКАТ/PNG/8934 (2.1).png';
import product8934_3 from './concrete/МагияБетонаЗАКАТ/PNG/8934 (2.2).png';
import product8934_4 from './concrete/МагияБетонаЗАКАТ/PNG/8934 (2.3).png';
import product8934_5 from './concrete/МагияБетонаЗАКАТ/PNG/8934 (коллаж).png';



// Dynamic product image storage (initialized once)
let dynamicImageMap: Record<string, string[]> | null = null;
let imageMapInitialized = false;

// Initialize the dynamic image map
const initializeImageMap = () => {
  if (imageMapInitialized) return;
  
  const imageModules: Record<string, string[]> = {};
  
  // Import all images from products directory and subdirectories (any depth)
  const imageImports = import.meta.glob('./**/*.{png,jpg,jpeg,webp}', { eager: true }) as Record<string, { default: string }>;
  
  // Process each image path
  Object.entries(imageImports).forEach(([path, module]) => {
    const filename = path.split('/').pop() || '';
    
    // Extract product ID from various naming patterns
    let productId: string | null = null;
    
    // Pattern 1: 8934-1.png, 8934-2.png, etc.
    let match = filename.match(/^(\d{4})-\d+\./);
    if (match) {
      productId = match[1];
    } else {
      // Pattern 2: 8933 (1).png, 8933 (2).png, etc.
      match = filename.match(/^(\d{4})\s*\([^)]+\)\./);
      if (match) {
        productId = match[1];
      } else {
        // Pattern 3: Just product code: 8934.jpg
        match = filename.match(/^(\d{4})\./);
        if (match) {
          productId = match[1];
        }
      }
    }
    
    if (productId && module.default && filename !== 'placeholder.jpg' && filename !== 'logo-placeholder.JPG') {
      if (!imageModules[productId]) {
        imageModules[productId] = [];
      }
      imageModules[productId].push(module.default);
    }
  });
  
  // Sort images for each product for consistent ordering
  Object.keys(imageModules).forEach(productId => {
    imageModules[productId].sort();
  });
  
  dynamicImageMap = imageModules;
  imageMapInitialized = true;
  
  console.log('🖼️ Dynamic image map initialized with', Object.keys(imageModules).length, 'products:', Object.keys(imageModules));
};

// Initialize image map immediately
initializeImageMap();

// Static fallback mappings for products with special paths  
const staticImageMap: Record<string, string[]> = {
  '8934': [product8934_1, product8934_2, product8934_3, product8934_4, product8934_5],
};

// Helper function to get product gallery
export const getProductGallery = (productId: string, collection: string = ''): string[] => {
  // Initialize image map if needed
  if (!imageMapInitialized) {
    initializeImageMap();
  }
  
  // First check static mappings (guaranteed to work)
  if (staticImageMap[productId]) {
    console.log(`📷 Found static images for product ${productId}:`, staticImageMap[productId].length, 'images');
    return staticImageMap[productId];
  }
  
  // Then check dynamic images
  if (dynamicImageMap && dynamicImageMap[productId] && dynamicImageMap[productId].length > 0) {
    console.log(`📷 Found dynamic images for product ${productId}:`, dynamicImageMap[productId].length, 'images');
    return dynamicImageMap[productId];
  }
  
  // If no specific product images available, use single placeholder
  console.log(`📷 No images found for product ${productId}, using placeholder`);
  return [placeholderImage];
};

// Function to get main image for catalog display
export const getProductMainImage = (productId: string, collection: string = ''): string => {
  // Initialize image map if needed
  if (!imageMapInitialized) {
    initializeImageMap();
  }
  
  // First check static mappings (guaranteed to work)
  if (staticImageMap[productId] && staticImageMap[productId].length > 0) {
    return staticImageMap[productId][0]; // Return first image
  }
  
  // Then check dynamic images
  if (dynamicImageMap && dynamicImageMap[productId] && dynamicImageMap[productId].length > 0) {
    return dynamicImageMap[productId][0]; // Return first image
  }
  
  // If no specific product images available, use placeholder
  return placeholderImage;
};

