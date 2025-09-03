import { Router, Request, Response } from 'express';
import sharp from 'sharp';
import fs from 'fs';
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
    const buffer = await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten with white background
      .jpeg({ 
        quality: Math.round(quality * 100),
        progressive: true 
      })
      .toBuffer();
    
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

    // Generate cache key with white background version
    const cacheKey = getCacheKey(src, sizeNum, qualityNum, whitebg ? 'whitebg' : '');
    
    // Check cache first
    const cachedPath = getCachedThumbnail(cacheKey);
    if (cachedPath) {
      console.log(`Serving cached thumbnail: ${cacheKey}`);
      return res.sendFile(cachedPath);
    }

    // Convert src to actual file path
    let filePath: string;
    
    // Decode URL-encoded characters first
    const decodedSrc = decodeURIComponent(src);
    
    if (decodedSrc.startsWith('/assets/')) {
      // Handle frontend URL format like /assets/products/image.jpg
      filePath = path.join(process.cwd(), 'client/src', decodedSrc.replace(/^\//, ''));
    } else if (decodedSrc.startsWith('/src/assets/')) {
      // Handle webpack format
      const cleanPath = decodedSrc.replace(/^\/src\/assets\//, '');
      filePath = path.join(process.cwd(), 'client/src/assets', cleanPath);
    } else {
      // Handle relative paths
      filePath = path.join(process.cwd(), 'client/src/assets/products', decodedSrc);
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

    // Generate thumbnail
    const thumbnailBuffer = await generateThumbnail(filePath, sizeNum, qualityNum);

    // Save to cache
    const cachePath = path.join(CACHE_DIR, cacheKey);
    fs.writeFileSync(cachePath, thumbnailBuffer);

    // Send response
    res.set({
      'Content-Type': 'image/jpeg',
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

export default router;