// Gallery image mapping system for React/Vite
const galleryImages = new Map<string, string>();

// Import all images from gallery directory
const imageImports = import.meta.glob("./*.{png,jpg,jpeg,webp}", {
  eager: true,
}) as Record<string, { default: string }>;

// Process each image path
Object.entries(imageImports).forEach(([path, module]) => {
  // Extract filename from path (e.g., "./gallery-25.jpg" -> "gallery-25.jpg")
  const filename = path.replace('./', '');
  
  // Map both the full path and the filename to the imported URL
  galleryImages.set(`/assets/gallery/${filename}`, module.default);
  galleryImages.set(filename, module.default);
});

/**
 * Get the correct imported URL for a gallery image
 * @param imagePath - The path from database (e.g., "/assets/gallery/gallery-25.jpg")
 * @returns The imported image URL or placeholder if not found
 */
export function getGalleryImageUrl(imagePath: string): string {
  // Return the mapped URL or fallback to placeholder
  return galleryImages.get(imagePath) || "/placeholder-product.jpg";
}

/**
 * Get all available gallery images
 * @returns Array of image URLs
 */
export function getAllGalleryImages(): string[] {
  return Array.from(galleryImages.values());
}

/**
 * Check if a gallery image exists
 * @param imagePath - The path to check
 * @returns True if image exists
 */
export function hasGalleryImage(imagePath: string): boolean {
  return galleryImages.has(imagePath);
}