import { Router, Request, Response } from 'express';
import sharp from 'sharp';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = Router();
const CACHE_DIR = path.join(process.cwd(), '.thumbnail-cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

interface ThumbnailParams {
  src: string;
  size?: number;
  quality?: number;
}

// Generate cache key
function getCacheKey(src: string, size: number, quality: number, version: string = ''): string {
  const hash = crypto.createHash('md5').update(`${src}-${size}-${quality}-${version}`).digest('hex');
  return `thumb-${hash}.jpg`;
}

// Check if file exists in cache
function getCachedThumbnail(cacheKey: string): string | null {
  const cachePath = path.join(CACHE_DIR, cacheKey);
  if (fs.existsSync(cachePath)) {
    return cachePath;
  }
  return null;
}

// Generate thumbnail using Sharp
async function generateThumbnail(
  inputPath: string, 
  size: number, 
  quality: number
): Promise<Buffer> {
  try {
    const isPlaceholder = inputPath.includes('placeholder.jpg');
    
    let sharpInstance = sharp(inputPath);
    
    if (isPlaceholder) {
      // Special handling for placeholder - maintain aspect ratio, no white background
      sharpInstance = sharpInstance
        .resize(size, size, {
          fit: 'contain',
          position: 'center',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png({ quality: 100 }); // Use PNG to preserve transparency and quality
    } else {
      // Regular product images - square crop with white background
      sharpInstance = sharpInstance
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ 
          quality: Math.round(quality * 100),
          progressive: true 
        });
    }
    
    const buffer = await sharpInstance.toBuffer();
    return buffer;
  } catch (error) {
    console.error('Sharp processing error:', error);
    throw new Error('Failed to process image');
  }
}

// Main thumbnail endpoint
router.get('/thumbnail', async (req: Request, res: Response) => {
  try {
    const { src, size = '200', quality = '0.8', whitebg = '' } = req.query;
    
    if (!src || typeof src !== 'string') {
      return res.status(400).json({ error: 'Missing src parameter' });
    }

    const sizeNum = Number(size);
    const qualityNum = Number(quality);

    // Validate parameters
    if (isNaN(sizeNum) || sizeNum < 10 || sizeNum > 1000) {
      console.log(`Invalid size parameter: ${size} (parsed as ${sizeNum})`);
      return res.status(400).json({ error: 'Size must be between 10 and 1000' });
    }

    if (qualityNum < 0.1 || qualityNum > 1) {
      return res.status(400).json({ error: 'Quality must be between 0.1 and 1' });
    }

    // Decode URL-encoded characters first
    const decodedSrc = decodeURIComponent(src);
    const isPlaceholder = decodedSrc.includes('placeholder.jpg');
    
    // Generate cache key with white background version and placeholder flag
    const cacheKey = getCacheKey(src, sizeNum, qualityNum, whitebg ? 'whitebg' : (isPlaceholder ? 'png' : ''));
    
    // Check cache first
    const cachedPath = getCachedThumbnail(cacheKey);
    if (cachedPath) {
      console.log(`Serving cached thumbnail: ${cacheKey}`);
      return res.sendFile(cachedPath);
    }

    // Convert src to actual file path
    let filePath: string;
    
    if (decodedSrc.startsWith('/assets/')) {
      // Handle frontend URL format like /assets/products/image.jpg
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        filePath = path.join(process.cwd(), 'client/src', decodedSrc.replace(/^\//, ''));
      } else {
        // In production, assets are in dist/public
        filePath = path.join(process.cwd(), 'dist/public', decodedSrc.replace(/^\//, ''));
      }
    } else if (decodedSrc.startsWith('/src/assets/')) {
      // Handle webpack format
      const cleanPath = decodedSrc.replace(/^\/src\/assets\//, '');
      filePath = path.join(process.cwd(), 'client/src/assets', cleanPath);
    } else if (decodedSrc.startsWith('/api/admin/static-images/')) {
      // Handle admin panel URLs like /api/admin/static-images/concrete/image.png
      const cleanSrc = decodedSrc.split('?')[0]; // Remove timestamp query params
      const pathParts = cleanSrc.replace('/api/admin/static-images/', '').split('/');
      const folder = pathParts[0]; // concrete, matte, etc.
      const filename = pathParts.slice(1).join('/'); // image filename with possible subdirs
      
      // Choose correct base directory for dev vs production
      const isDev = process.env.NODE_ENV === 'development';
      const baseAssetsDir = isDev 
        ? path.join(process.cwd(), 'client/src/assets/products') 
        : path.join(process.cwd(), 'dist/public/assets');
      
      // First try direct path
      const directPath = path.join(baseAssetsDir, folder, filename);
      if (fs.existsSync(directPath)) {
        filePath = directPath;
      } else {
        // Try recursive search in subfolders
        const baseDir = path.join(baseAssetsDir, folder);
        const foundPath = findFileRecursively(baseDir, filename);
        if (foundPath) {
          filePath = foundPath;
        } else {
          filePath = directPath; // fallback to direct path for error handling
        }
      }
    } else {
      // Handle relative paths
      const isDev = process.env.NODE_ENV === 'development';
      const baseDir = isDev 
        ? path.join(process.cwd(), 'client/src/assets/products') 
        : path.join(process.cwd(), 'dist/public/assets');
      filePath = path.join(baseDir, decodedSrc);
    }

    // Debug logging
    console.log(`Thumbnail request - src: ${src}`);
    console.log(`Decoded src: ${decodedSrc}`);
    console.log(`Resolved file path: ${filePath}`);
    
    // Check if source file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return res.status(404).json({ error: 'Source image not found', path: filePath });
    }

    console.log(`Generating thumbnail for: ${filePath} (${sizeNum}x${sizeNum}, quality: ${qualityNum})`);

    // Check if this is placeholder image again
    const isPlaceholderForResponse = filePath.includes('placeholder.jpg');

    // Generate thumbnail
    const thumbnailBuffer = await generateThumbnail(filePath, sizeNum, qualityNum);

    // Save to cache with appropriate extension
    const cacheExtension = isPlaceholderForResponse ? '.png' : '.jpg';
    const cachePath = path.join(CACHE_DIR, cacheKey.replace('.jpg', cacheExtension));
    fs.writeFileSync(cachePath, thumbnailBuffer);

    // Send response with correct Content-Type
    res.set({
      'Content-Type': isPlaceholderForResponse ? 'image/png' : 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      'Content-Length': thumbnailBuffer.length.toString(),
      'ETag': `"${cacheKey}"` // Add ETag for cache busting
    });

    res.send(thumbnailBuffer);

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
});

// Clear cache endpoint (admin only)
router.delete('/thumbnail-cache', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      if (file.startsWith('thumb-')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    });
    res.json({ message: `Cleared ${files.length} cached thumbnails` });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Helper function to find file in subdirectories
function findFileRecursively(dir: string, targetFilename: string): string | null {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const found = findFileRecursively(fullPath, targetFilename);
        if (found) return found;
      } else if (item.isFile() && item.name === targetFilename) {
        return fullPath;
      }
    }
  } catch (error) {
    // Directory access error
  }
  
  return null;
}

export default router;