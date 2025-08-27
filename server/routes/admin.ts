import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

const router = Router();

// Helper functions for finding product images
const isProductImageFileGlobal = (filename: string, productId: string): boolean => {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  if (!isImage) return false;
  
  // Pattern 1: 8934-1.png, 8934-2.png
  if (filename.startsWith(`${productId}-`)) return true;
  
  // Pattern 2: 8934 (2.2).png, 8934 (коллаж).png  
  if (filename.startsWith(`${productId} (`)) return true;
  
  // Pattern 3: 8934.jpg
  if (filename === `${productId}.jpg` || filename === `${productId}.png`) return true;
  
  return false;
};

const findProductImagesGlobal = async (dir: string, productId: string): Promise<string[]> => {
  const results: string[] = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Recursively search subdirectories
        const subImages = await findProductImagesGlobal(fullPath, productId);
        results.push(...subImages);
      } else if (item.isFile()) {
        // Check if file matches product pattern
        if (isProductImageFileGlobal(item.name, productId)) {
          results.push(item.name);
        }
      }
    }
  } catch (error) {
    // Directory access error, skip
  }
  
  return results;
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get existing images for a product
router.get('/product-images/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { folder } = req.query;
    
    if (!productId || !folder) {
      return res.status(400).json({ error: 'Missing productId or folder parameter' });
    }

    const folderPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder as string);
    
    // Helper functions for finding product images
    const isProductImageFile = (filename: string, productId: string): boolean => {
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
      if (!isImage) return false;
      
      // Pattern 1: 8934-1.png, 8934-2.png
      if (filename.startsWith(`${productId}-`)) return true;
      
      // Pattern 2: 8934 (2.2).png, 8934 (коллаж).png  
      if (filename.startsWith(`${productId} (`)) return true;
      
      // Pattern 3: 8934.jpg
      if (filename === `${productId}.jpg` || filename === `${productId}.png`) return true;
      
      return false;
    };
    
    const findProductImages = async (dir: string, productId: string): Promise<string[]> => {
      const results: string[] = [];
      
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            // Recursively search subdirectories
            const subImages = await findProductImages(fullPath, productId);
            results.push(...subImages);
          } else if (item.isFile()) {
            // Check if file matches product pattern
            if (isProductImageFile(item.name, productId)) {
              results.push(item.name);
            }
          }
        }
      } catch (error) {
        // Directory access error, skip
      }
      
      return results;
    };

    try {
      // Search for images recursively in subfolders
      const productImages = await findProductImages(folderPath, productId);
      console.log(`API: Found ${productImages.length} images for product ${productId} in ${folderPath}`);
      console.log(`API: Images:`, productImages);
      
      res.json({ 
        success: true, 
        images: productImages,
        productId 
      });
    } catch {
      // Folder doesn't exist - return empty array
      res.json({ 
        success: true, 
        images: [],
        productId 
      });
    }

  } catch (error) {
    console.error('Error getting product images:', error);
    res.status(500).json({ error: 'Failed to get product images' });
  }
});

// Delete an image
router.delete('/delete-image', async (req, res) => {
  try {
    const { productId, fileName, folder } = req.body;
    
    if (!productId || !fileName || !folder) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const filePath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder, fileName);
    
    try {
      await fs.unlink(filePath);
      
      // Update imageMap.ts to remove the deleted image
      await removeImageFromMap(productId, fileName, folder);
      
      res.json({ 
        success: true, 
        message: `Deleted ${fileName}` 
      });
    } catch {
      res.status(404).json({ error: 'File not found' });
    }

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Upload images for a product
router.post('/upload-images', upload.any(), async (req, res) => {
  try {
    const { productId, collection, folder } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!productId || !collection || !folder || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or files' });
    }

    // Create folder path
    const folderPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder);
    
    // Ensure folder exists
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }

    // Save each file
    const savedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = path.extname(file.originalname);
      const fileName = `${productId}-${i + 1}${extension}`;
      const filePath = path.join(folderPath, fileName);

      await fs.writeFile(filePath, file.buffer);
      savedFiles.push(fileName);
    }

    // Update imageMap.ts file
    await updateImageMap(productId, savedFiles, folder);

    res.json({ 
      success: true, 
      message: `Uploaded ${savedFiles.length} images for product ${productId}`,
      files: savedFiles 
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Set main image for product (move to first position)
router.put('/set-main-image', async (req, res) => {
  try {
    const { productId, folder, fileName } = req.body;
    
    if (!productId || !folder || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find all images for this product
    const folderPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder);
    const allImages = await findProductImagesGlobal(folderPath, productId);
    
    if (!allImages.includes(fileName)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Move the selected image to first position
    const reorderedImages = [fileName, ...allImages.filter((img: string) => img !== fileName)];

    res.json({ 
      success: true, 
      message: `Set ${fileName} as main image for product ${productId}`,
      files: reorderedImages 
    });

  } catch (error) {
    console.error('Error setting main image:', error);
    res.status(500).json({ error: 'Failed to set main image' });
  }
});

// Move image up in order
router.put('/move-image-up', async (req, res) => {
  try {
    const { productId, folder, fileName } = req.body;
    
    if (!productId || !folder || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find all images for this product
    const folderPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder);
    const allImages = await findProductImagesGlobal(folderPath, productId);
    
    const currentIndex = allImages.indexOf(fileName);
    if (currentIndex <= 0) {
      return res.status(400).json({ error: 'Image is already first or not found' });
    }

    // Swap with previous image
    const reorderedImages = [...allImages];
    [reorderedImages[currentIndex - 1], reorderedImages[currentIndex]] = 
    [reorderedImages[currentIndex], reorderedImages[currentIndex - 1]];

    res.json({ 
      success: true, 
      message: `Moved ${fileName} up for product ${productId}`,
      files: reorderedImages 
    });

  } catch (error) {
    console.error('Error moving image up:', error);
    res.status(500).json({ error: 'Failed to move image up' });
  }
});

// Move image down in order  
router.put('/move-image-down', async (req, res) => {
  try {
    const { productId, folder, fileName } = req.body;
    
    if (!productId || !folder || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find all images for this product
    const folderPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder);
    const allImages = await findProductImagesGlobal(folderPath, productId);
    
    const currentIndex = allImages.indexOf(fileName);
    if (currentIndex < 0 || currentIndex >= allImages.length - 1) {
      return res.status(400).json({ error: 'Image is already last or not found' });
    }

    // Swap with next image
    const reorderedImages = [...allImages];
    [reorderedImages[currentIndex + 1], reorderedImages[currentIndex]] = 
    [reorderedImages[currentIndex], reorderedImages[currentIndex + 1]];

    res.json({ 
      success: true, 
      message: `Moved ${fileName} down for product ${productId}`,
      files: reorderedImages 
    });

  } catch (error) {
    console.error('Error moving image down:', error);
    res.status(500).json({ error: 'Failed to move image down' });
  }
});

// Reorder product images
router.put('/reorder-images', async (req, res) => {
  try {
    const { productId, folder, fileNames } = req.body;
    
    if (!productId || !folder || !Array.isArray(fileNames)) {
      return res.status(400).json({ error: 'Missing required fields or invalid data' });
    }

    const folderPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder);
    
    // Verify all files exist
    for (const fileName of fileNames) {
      const filePath = path.join(folderPath, fileName);
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: `File not found: ${fileName}` });
      }
    }

    // Create temporary names to avoid conflicts during renaming
    const tempFileNames = [];
    for (let i = 0; i < fileNames.length; i++) {
      const originalFile = fileNames[i];
      const extension = path.extname(originalFile);
      const tempFileName = `${productId}-temp-${i + 1}${extension}`;
      tempFileNames.push(tempFileName);
      
      const oldPath = path.join(folderPath, originalFile);
      const tempPath = path.join(folderPath, tempFileName);
      await fs.rename(oldPath, tempPath);
    }

    // Now rename temp files to final names in new order
    const newFileNames = [];
    for (let i = 0; i < tempFileNames.length; i++) {
      const tempFile = tempFileNames[i];
      const extension = path.extname(tempFile);
      const newFileName = `${productId}-${i + 1}${extension}`;
      newFileNames.push(newFileName);
      
      const tempPath = path.join(folderPath, tempFile);
      const newPath = path.join(folderPath, newFileName);
      await fs.rename(tempPath, newPath);
    }

    // Update imageMap.ts file
    await updateImageMap(productId, newFileNames, folder);

    res.json({ 
      success: true, 
      message: `Reordered ${newFileNames.length} images for product ${productId}`,
      files: newFileNames 
    });

  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({ error: 'Failed to reorder images' });
  }
});

// Function to remove image from imageMap.ts
async function removeImageFromMap(productId: string, fileName: string, folder: string) {
  const imageMapPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', 'imageMap.ts');
  
  try {
    let content = await fs.readFile(imageMapPath, 'utf-8');

    // Extract index from fileName (e.g., "8934-2.jpg" -> index 2)
    const fileIndex = parseInt(fileName.split('-')[1].split('.')[0]);
    const varName = `product${productId}_${fileIndex}`;

    // Remove import statement
    const importRegex = new RegExp(`import ${varName} from '\\.\/${folder}\/${fileName}';\n?`, 'g');
    content = content.replace(importRegex, '');

    // Update specificImageMap - remove the image reference
    const productMapRegex = new RegExp(`'${productId}':\\s*\\[([^\\]]+)\\]`);
    const match = content.match(productMapRegex);
    
    if (match) {
      const currentImages = match[1].split(',').map(s => s.trim()).filter(s => s !== varName);
      
      if (currentImages.length > 0) {
        // Update with remaining images
        const newArrayContent = `[${currentImages.join(', ')}]`;
        content = content.replace(productMapRegex, `'${productId}': ${newArrayContent}`);
      } else {
        // Remove the entire product entry if no images left
        const fullEntryRegex = new RegExp(`\\s*'${productId}':\\s*\\[([^\\]]+)\\],?.*?\n`, 'g');
        content = content.replace(fullEntryRegex, '');
      }
    }

    await fs.writeFile(imageMapPath, content, 'utf-8');
  } catch (error) {
    console.error('Error removing image from map:', error);
  }
}

// Function to update imageMap.ts
async function updateImageMap(productId: string, fileNames: string[], folder: string) {
  const imageMapPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', 'imageMap.ts');
  
  try {
    // Read current imageMap content
    let content = await fs.readFile(imageMapPath, 'utf-8');

    // Add import statements
    const imports = fileNames.map((fileName, index) => {
      const varName = `product${productId}_${index + 1}`;
      return `import ${varName} from './${folder}/${fileName}';`;
    }).join('\n');

    // Find where to insert imports (after existing imports)
    const importInsertPoint = content.indexOf('// Map collection names');
    if (importInsertPoint > -1) {
      content = content.slice(0, importInsertPoint) + 
                imports + '\n\n// Map collection names' + 
                content.slice(importInsertPoint + '// Map collection names'.length);
    }

    // Update specificImageMap
    const varNames = fileNames.map((_, index) => `product${productId}_${index + 1}`);
    const arrayContent = `[${varNames.join(', ')}]`;
    
    // Check if product already exists in specificImageMap
    const productMapRegex = new RegExp(`'${productId}':\\s*\\[[^\\]]*\\]`);
    if (productMapRegex.test(content)) {
      // Replace existing entry
      content = content.replace(productMapRegex, `'${productId}': ${arrayContent}`);
    } else {
      // Add new entry
      const mapInsertPoint = content.indexOf('};', content.indexOf('specificImageMap'));
      if (mapInsertPoint > -1) {
        const newEntry = `  '${productId}': ${arrayContent}, // ${productId} - has ${fileNames.length} photos\n`;
        content = content.slice(0, mapInsertPoint) + newEntry + content.slice(mapInsertPoint);
      }
    }

    await fs.writeFile(imageMapPath, content, 'utf-8');
  } catch (error) {
    console.error('Error updating imageMap:', error);
  }
}

// Hero images management
router.get('/hero-images', async (req, res) => {
  try {
    const heroPath = path.join(process.cwd(), 'client', 'src', 'assets', 'hero');
    
    try {
      const files = await fs.readdir(heroPath);
      const heroImages = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      
      res.json({ 
        success: true, 
        images: heroImages
      });
    } catch {
      // Folder doesn't exist - return empty array
      res.json({ 
        success: true, 
        images: []
      });
    }

  } catch (error) {
    console.error('Error getting hero images:', error);
    res.status(500).json({ error: 'Failed to get hero images' });
  }
});

// Upload hero images
router.post('/upload-hero-images', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Create hero folder path
    const heroPath = path.join(process.cwd(), 'client', 'src', 'assets', 'hero');
    
    // Ensure folder exists
    try {
      await fs.access(heroPath);
    } catch {
      await fs.mkdir(heroPath, { recursive: true });
    }

    // Get existing files count to continue numbering
    const existingFiles = await fs.readdir(heroPath).catch(() => []);
    const existingCount = existingFiles.filter(file => 
      /^hero-\d+\./i.test(file)
    ).length;

    // Save each file
    const savedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = path.extname(file.originalname);
      const fileName = `hero-${existingCount + i + 1}${extension}`;
      const filePath = path.join(heroPath, fileName);

      await fs.writeFile(filePath, file.buffer);
      savedFiles.push(fileName);
    }

    res.json({ 
      success: true, 
      message: `Uploaded ${savedFiles.length} hero images`,
      files: savedFiles 
    });

  } catch (error) {
    console.error('Error uploading hero images:', error);
    res.status(500).json({ error: 'Failed to upload hero images' });
  }
});

// Delete hero image
router.delete('/delete-hero-image', async (req, res) => {
  try {
    const { fileName } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'Missing fileName' });
    }

    const filePath = path.join(process.cwd(), 'client', 'src', 'assets', 'hero', fileName);
    
    try {
      await fs.unlink(filePath);
      
      res.json({ 
        success: true, 
        message: `Deleted ${fileName}` 
      });
    } catch {
      res.status(404).json({ error: 'File not found' });
    }

  } catch (error) {
    console.error('Error deleting hero image:', error);
    res.status(500).json({ error: 'Failed to delete hero image' });
  }
});

// Upload gallery images
router.post('/upload-gallery-images', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Create gallery folder path
    const galleryPath = path.join(process.cwd(), 'client', 'src', 'assets', 'gallery');
    
    // Ensure folder exists
    try {
      await fs.access(galleryPath);
    } catch {
      await fs.mkdir(galleryPath, { recursive: true });
    }

    // Get existing files count to continue numbering
    const existingFiles = await fs.readdir(galleryPath).catch(() => []);
    const existingCount = existingFiles.filter(file => 
      /^gallery-\d+\./i.test(file)
    ).length;

    // Save each file and return URLs
    const savedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = path.extname(file.originalname);
      const fileName = `gallery-${existingCount + i + 1}${extension}`;
      const filePath = path.join(galleryPath, fileName);

      await fs.writeFile(filePath, file.buffer);
      savedFiles.push({
        fileName,
        url: `/assets/gallery/${fileName}`
      });
    }

    res.json({ 
      success: true, 
      message: `Uploaded ${savedFiles.length} gallery images`,
      files: savedFiles 
    });

  } catch (error) {
    console.error('Error uploading gallery images:', error);
    res.status(500).json({ error: 'Failed to upload gallery images' });
  }
});

// Get gallery images
router.get('/gallery-images', async (req, res) => {
  try {
    const galleryPath = path.join(process.cwd(), 'client', 'src', 'assets', 'gallery');
    
    // Check if gallery folder exists
    try {
      await fs.access(galleryPath);
    } catch {
      return res.json({ success: true, images: [] });
    }

    // Read gallery directory
    const files = await fs.readdir(galleryPath);
    
    // Filter image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    res.json({ 
      success: true, 
      images: imageFiles.sort() 
    });

  } catch (error) {
    console.error('Error reading gallery images:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to read gallery images' 
    });
  }
});

// Serve static product images from any subdirectory
router.get('/static-images/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    
    // Validate folder 
    const allowedFolders = ['concrete', 'fabric', 'matte', 'marble', 'accessories'];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ error: 'Invalid folder' });
    }

    // Find the file recursively in subfolders
    const baseDir = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder);
    const filePath = await findFileRecursively(baseDir, filename);
    
    if (!filePath) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    try {
      // Set appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', 
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }[ext] || 'image/jpeg';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      const fileBuffer = await fs.readFile(filePath);
      res.send(fileBuffer);
      
    } catch (error) {
      res.status(404).json({ error: 'Image not found' });
    }

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Helper function to find file in subdirectories
async function findFileRecursively(dir: string, targetFilename: string): Promise<string | null> {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const found = await findFileRecursively(fullPath, targetFilename);
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