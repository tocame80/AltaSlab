// Product Images Configuration
// Dynamic image discovery system - automatically finds images for all products
// Supports multiple naming patterns: 8934-1.jpg, 8933 (1).png, etc.

// Import placeholder image (used when no specific product images available)
import placeholderImage from './placeholder.jpg';

// Static imports for known products (kept for immediate availability)
// Note: Removed static imports due to file path encoding issues - using dynamic imports instead



// Dynamic product image storage (initialized once)
let dynamicImageMap: Record<string, string[]> | null = null;
let imageMapInitialized = false;

// Function to reset the image map (for admin updates)
export const resetImageMap = () => {
  console.log('🔄 Resetting image map cache...');
  dynamicImageMap = null;
  imageMapInitialized = false;
};

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

// Static image mappings for products with custom ordering (set by admin)
// These take priority over dynamic discovery to respect admin-set main images

// Function to resolve static image paths to URLs
const resolveStaticImages = (paths: string[]): string[] => {
  const imageImports = import.meta.glob('./**/*.{png,jpg,jpeg,webp}', { eager: true }) as Record<string, { default: string }>;
  
  return paths.map(path => {
    // First try exact match
    if (imageImports[path] && imageImports[path].default) {
      return imageImports[path].default;
    }
    
    // If exact match fails, try to find by filename
    const fileName = path.split('/').pop();
    if (fileName) {
      const matchingKey = Object.keys(imageImports).find(key => {
        const keyFileName = key.split('/').pop();
        return keyFileName === fileName;
      });
      if (matchingKey && imageImports[matchingKey]) {
        return imageImports[matchingKey].default;
      }
    }
    
    console.warn(`Could not resolve static image path: ${path}`);
    return null;
  }).filter((url): url is string => url !== null); // Remove null values
};

// Static fallback mappings for products with special paths  
const staticImageMap: Record<string, string[]> = {
  // Admin-set image orders will be populated here dynamically
  '8934': [
    "./concrete/8934 (1).png",
    "./concrete/8934 (2.1).png", 
    "./concrete/8934 (2.2).png",
    "./concrete/8934 (2.3).png",
    "./concrete/8934 (коллаж).png"
  ], // Admin-set order for product 8934
};

// Helper function to get product gallery
export const getProductGallery = (productId: string, collection: string = ''): string[] => {
  // Initialize image map if needed
  if (!imageMapInitialized) {
    initializeImageMap();
  }
  
  // First check static mappings (set by admin - these have custom ordering)
  if (staticImageMap[productId] && staticImageMap[productId].length > 0) {
    // Resolve the static paths to actual URLs
    const resolvedImages = resolveStaticImages(staticImageMap[productId]);
    if (resolvedImages.length > 0) {
      return resolvedImages;
    }
  }
  
  // Then check dynamic images (auto-discovered, sorted alphabetically)
  if (dynamicImageMap && dynamicImageMap[productId] && dynamicImageMap[productId].length > 0) {
    return dynamicImageMap[productId];
  }
  
  // If no specific product images available, use single placeholder
  return [placeholderImage];
};

// Function to get main image for catalog display
export const getProductMainImage = (productId: string, collection: string = '', color: string = ''): string => {
  // Special handling for profiles - use color-specific images
  if (collection.toLowerCase().includes('профиль')) {
    try {
      const profileImages = import.meta.glob('./accessories/**/*.{png,jpg,jpeg,webp}', { eager: true }) as Record<string, { default: string }>;
      
      // Map profile collection names to folder names - expanded mapping
      const collectionFolderMap: Record<string, string> = {
        'Профиль под рассеивателем': 'ПрофильПодРассеивателем',
        'Профиль соединительный': 'ПрофильСоединительный', 
        'Профиль торцевой': 'ПрофильТорцевой',
        'Профиль угловой': 'ПрофильУгловойУниверсальный',
        // Additional mappings for potential variations
        'Профиль угловой универсальный': 'ПрофильУгловойУниверсальный',
        'Профили': 'ПрофильПодРассеивателем' // Default fallback for generic "Профили"
      };
      
      const folderName = collectionFolderMap[collection];
      
      if (folderName && color) {
        // Look for image matching the color
        const colorKey = Object.keys(profileImages).find(path => 
          path.includes(folderName) && 
          path.toLowerCase().includes(color.toLowerCase())
        );
        
        if (colorKey && profileImages[colorKey]) {
          return profileImages[colorKey].default;
        }
      }
      
      // If no specific mapping found, try to match by product ID in filename
      if (color) {
        const productIdMatch = Object.keys(profileImages).find(path => 
          path.includes(productId) && 
          path.toLowerCase().includes(color.toLowerCase())
        );
        
        if (productIdMatch && profileImages[productIdMatch]) {
          return profileImages[productIdMatch].default;
        }
      }
      
    } catch (error) {
      console.warn('Failed to load profile image:', error);
    }
  }
  
  // Initialize image map if needed
  if (!imageMapInitialized) {
    initializeImageMap();
  }
  
  // First check static mappings (set by admin - these have custom ordering)
  if (staticImageMap[productId] && staticImageMap[productId].length > 0) {
    // Resolve the static paths to actual URLs
    const resolvedImages = resolveStaticImages(staticImageMap[productId]);
    if (resolvedImages.length > 0) {
      return resolvedImages[0]; // Return first image (main image set by admin)
    }
  }
  
  // Then check dynamic images (auto-discovered, sorted alphabetically)  
  if (dynamicImageMap && dynamicImageMap[productId] && dynamicImageMap[productId].length > 0) {
    return dynamicImageMap[productId][0]; // Return first image
  }
  
  // If no specific product images available, use placeholder
  return placeholderImage;
};

