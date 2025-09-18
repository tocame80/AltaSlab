// Product Images Configuration
// Dynamic image discovery system - automatically finds images for all products
// Supports multiple naming patterns: 8934-1.jpg, 8933 (1).png, etc.

// Import placeholder image (used when no specific product images available)
import placeholderImage from "./placeholder.jpg";

// Static imports for known products (kept for immediate availability)
// Note: Removed static imports due to file path encoding issues - using dynamic imports instead

// Dynamic product image storage (initialized once)
let dynamicImageMap: Record<string, string[]> | null = null;
let imageMapInitialized = false;

// Function to reset the image map (for admin updates)
export const resetImageMap = () => {
  console.log("🔄 Resetting image map cache...");
  dynamicImageMap = null;
  imageMapInitialized = false;
};

// Initialize the dynamic image map
const initializeImageMap = () => {
  if (imageMapInitialized) return;

  const imageModules: Record<string, string[]> = {};

  // Import all images from products directory and subdirectories (any depth)
  const imageImports = import.meta.glob("./**/*.{png,jpg,jpeg,webp}", {
    eager: true,
  }) as Record<string, { default: string }>;

  // Process each image path
  Object.entries(imageImports).forEach(([path, module]) => {
    const filename = path.split("/").pop() || "";

    // Extract product ID from various naming patterns
    let productId: string | null = null;

    // Pattern 1: 8934-1.png, 8934-2.png, etc.
    let match = filename.match(/^(\d{4})-\d+\./);
    if (match) {
      productId = match[1];
    } else {
      // Pattern 2: 8938_5.png, 8938_1.png, etc.
      match = filename.match(/^(\d{4})_\d+\./);
      if (match) {
        productId = match[1];
      } else {
        // Pattern 3: 8933 (1).png, 8933 (2).png, etc.
        match = filename.match(/^(\d{4})\s*\([^)]+\)\./);
        if (match) {
          productId = match[1];
        } else {
          // Pattern 4: Just product code: 8934.jpg
          match = filename.match(/^(\d{4})\./);
          if (match) {
            productId = match[1];
          }
        }
      }
    }

    if (
      productId &&
      module.default &&
      filename !== "placeholder.png" &&
      filename !== "logo-placeholder.JPG"
    ) {
      if (!imageModules[productId]) {
        imageModules[productId] = [];
      }
      imageModules[productId].push(module.default);
    }
  });

  // Sort images for each product for consistent ordering
  Object.keys(imageModules).forEach((productId) => {
    imageModules[productId].sort();
  });

  dynamicImageMap = imageModules;
  imageMapInitialized = true;

  // console.log('🖼️ Dynamic image map initialized with', Object.keys(imageModules).length, 'products:', Object.keys(imageModules));
};

// Initialize image map immediately
initializeImageMap();

// Static image mappings for products with custom ordering (set by admin)
// These take priority over dynamic discovery to respect admin-set main images

// Function to resolve static image paths to URLs
const resolveStaticImages = (paths: string[]): string[] => {
  const imageImports = import.meta.glob("./**/*.{png,jpg,jpeg,webp}", {
    eager: true,
  }) as Record<string, { default: string }>;

  return paths
    .map((path) => {
      // First try exact match
      if (imageImports[path] && imageImports[path].default) {
        return imageImports[path].default;
      }

      // If exact match fails, try to find by filename
      const fileName = path.split("/").pop();
      if (fileName) {
        const matchingKey = Object.keys(imageImports).find((key) => {
          const keyFileName = key.split("/").pop();
          return keyFileName === fileName;
        });
        if (matchingKey && imageImports[matchingKey]) {
          return imageImports[matchingKey].default;
        }
      }

      console.warn(`Could not resolve static image path: ${path}`);
      return null;
    })
    .filter((url): url is string => url !== null); // Remove null values
};

// Static fallback mappings for products with special paths
const staticImageMap: Record<string, string[]> = {
  // Admin-set image orders will be populated here dynamically when product images are uploaded  '8938': ["./concrete/8938_7.png","./concrete/8938_1.png","./concrete/8938_2.png","./concrete/8938_3.png","./concrete/8938_5.png","./concrete/8938_6.png"], // Admin-set order for product 8938
  '8931': ["./concrete/8931_7.png","./concrete/8931_1.png","./concrete/8931_2.png","./concrete/8931_3.png","./concrete/8931_5.png","./concrete/8931_6.png"], // Admin-set order for product 8931
  '8883': ["./matte/8883 (3).png","./matte/8883 (1).png"], // Admin-set order for product 8883
  '8937': ["./concrete/8937_7.png","./concrete/8937_1.png","./concrete/8937_2.png","./concrete/8937_3.png","./concrete/8937_5.png","./concrete/8937_6.png"], // Admin-set order for product 8937
  '8940': ["./concrete/8940_7.png","./concrete/8940_1.png","./concrete/8940_2.png","./concrete/8940_3.png","./concrete/8940_5.png","./concrete/8940_6.png"], // Admin-set order for product 8940
  '8939': ["./concrete/8939_7.png","./concrete/8939_1.png","./concrete/8939_2.png","./concrete/8939_3.png","./concrete/8939_5.png","./concrete/8939_6.png"], // Admin-set order for product 8939
  '8933': ["./concrete/8933 (3).png","./concrete/8933 (2.2).png","./concrete/8933 (2.3).png"], // Admin-set order for product 8933
  '8941': ["./concrete/8941_7.png","./concrete/8941_1.png","./concrete/8941_2.png","./concrete/8941_3.png","./concrete/8941_5.png","./concrete/8941_6.png"], // Admin-set order for product 8941
  '8886': ["./matte/8886 (3).png","./matte/8886 (1).png"], // Admin-set order for product 8886
};

// Helper function to get product gallery
export const getProductGallery = (
  productId: string,
  collection: string = "",
): string[] => {
  // Special handling for glue - use specific image from Клей folder
  if (collection === "Клей" || collection.toLowerCase().includes("клей")) {
    try {
      const glueImages = import.meta.glob(
        "./accessories/Клей/*.{png,jpg,jpeg,webp}",
        { eager: true },
      ) as Record<string, { default: string }>;

      const glueImagePaths = Object.values(glueImages).map((module) => {
        // Decode URL-encoded path to handle Cyrillic characters
        return decodeURIComponent(module.default);
      });

      if (glueImagePaths.length > 0) {
        return glueImagePaths;
      }
    } catch (error) {
      console.warn("Failed to load glue images:", error);
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
      return resolvedImages;
    }
  }

  // Then check dynamic images (auto-discovered, sorted alphabetically)
  if (
    dynamicImageMap &&
    dynamicImageMap[productId] &&
    dynamicImageMap[productId].length > 0
  ) {
    return dynamicImageMap[productId];
  }

  // If no specific product images available, use single placeholder
  return [placeholderImage];
};

// Function to get main image for catalog display
export const getProductMainImage = (
  productId: string,
  collection: string = "",
  color: string = "",
): string => {
  // Special handling for glue - use specific image from Клей folder
  if (collection === "Клей" || collection.toLowerCase().includes("клей")) {
    try {
      const glueImages = import.meta.glob(
        "./accessories/Клей/*.{png,jpg,jpeg,webp}",
        { eager: true },
      ) as Record<string, { default: string }>;

      // Return the first available glue image
      const glueImageKey = Object.keys(glueImages)[0];
      if (glueImageKey && glueImages[glueImageKey]) {
        const imagePath = glueImages[glueImageKey].default;
        // Decode URL-encoded path to handle Cyrillic characters
        const decodedPath = decodeURIComponent(imagePath);
        return decodedPath;
      }
    } catch (error) {
      console.warn("Failed to load glue image:", error);
    }
  }

  // Special handling for profiles - use color-specific images
  if (collection.toLowerCase().includes("профиль")) {
    try {
      const profileImages = import.meta.glob(
        "./accessories/**/*.{png,jpg,jpeg,webp}",
        { eager: true },
      ) as Record<string, { default: string }>;

      // Map profile collection names to folder names - expanded mapping
      const collectionFolderMap: Record<string, string> = {
        "Профиль под рассеивателем": "ПрофильПодРассеивателем",
        "Профиль соединительный": "ПрофильСоединительный",
        "Профиль торцевой": "ПрофильТорцевой",
        "Профиль угловой": "ПрофильУгловойУниверсальный",
        // Additional mappings for potential variations
        "Профиль угловой универсальный": "ПрофильУгловойУниверсальный",
        Профили: "ПрофильПодРассеивателем", // Default fallback for generic "Профили"
      };

      const folderName = collectionFolderMap[collection];

      if (folderName && color) {
        // Look for image matching the color
        const colorKey = Object.keys(profileImages).find(
          (path) =>
            path.includes(folderName) &&
            path.toLowerCase().includes(color.toLowerCase()),
        );

        if (colorKey && profileImages[colorKey]) {
          return profileImages[colorKey].default;
        }
      }

      // If no specific mapping found, try to match by product ID in filename
      if (color) {
        const productIdMatch = Object.keys(profileImages).find(
          (path) =>
            path.includes(productId) &&
            path.toLowerCase().includes(color.toLowerCase()),
        );

        if (productIdMatch && profileImages[productIdMatch]) {
          return profileImages[productIdMatch].default;
        }
      }
    } catch (error) {
      console.warn("Failed to load profile image:", error);
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
  if (
    dynamicImageMap &&
    dynamicImageMap[productId] &&
    dynamicImageMap[productId].length > 0
  ) {
    return dynamicImageMap[productId][0]; // Return first image
  }

  // If no specific product images available, use placeholder
  return placeholderImage;
};

// Function to get HD version of image for download
export const getHDImageUrl = (imageSrc: string): string => {
  // For now, return the original since all current images are HD
  // Later when you organize files, you can implement proper HD/web separation
  return imageSrc;
};

// Function to check image resolution and determine if it's large
export const checkImageSize = (
  imageSrc: string,
): Promise<{ width: number; height: number; isLarge: boolean }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const isLarge = img.width > 4000 || img.height > 4000; // HD images are usually 6000x6000
      resolve({ width: img.width, height: img.height, isLarge });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0, isLarge: false });
    };
    img.src = imageSrc;
  });
};

// Cache for image size information
const imageSizeCache: Record<
  string,
  { width: number; height: number; isLarge: boolean }
> = {};

// Function to get cached image size or check it
export const getCachedImageSize = async (
  imageSrc: string,
): Promise<{ width: number; height: number; isLarge: boolean }> => {
  if (imageSizeCache[imageSrc]) {
    return imageSizeCache[imageSrc];
  }

  const sizeInfo = await checkImageSize(imageSrc);
  imageSizeCache[imageSrc] = sizeInfo;
  return sizeInfo;
};

// Function to check if image is likely large (>5MB) based on resolution
export const isLargeImage = async (imageSrc: string): Promise<boolean> => {
  const sizeInfo = await getCachedImageSize(imageSrc);
  return sizeInfo.isLarge;
};

// Function to filter out extremely large images from gallery for performance
export const getOptimizedGallery = (
  productId: string,
  collection: string = "",
): string[] => {
  const allImages = getProductGallery(productId, collection);

  // For now, return first 6 images to avoid performance issues
  // Large image detection will happen during rendering
  return allImages.slice(0, 6);
};
