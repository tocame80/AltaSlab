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

const findProductImagesGlobal = async (dir: string, productId: string): Promise<{ fileName: string, fullPath: string }[]> => {
  const results: { fileName: string, fullPath: string }[] = [];
  
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
          results.push({
            fileName: item.name,
            fullPath: fullPath
          });
        }
      }
    }
  } catch (error) {
    // Directory access error, skip
  }
  
  return results.sort((a, b) => a.fileName.localeCompare(b.fileName)); // Sort by filename
};

// Function to rename files to preserve order
const renameFilesToOrder = async (folderPath: string, productId: string, orderedImages: { fileName: string, fullPath: string }[]) => {
  try {
    // Create temporary names to avoid conflicts
    const tempRenames = [];
    
    for (let i = 0; i < orderedImages.length; i++) {
      const image = orderedImages[i];
      const extension = path.extname(image.fileName);
      const tempName = `${productId}_temp_${i}${extension}`;
      const newName = `${productId}-${i + 1}${extension}`;
      
      const currentPath = image.fullPath;
      const tempPath = path.join(path.dirname(currentPath), tempName);
      const newPath = path.join(path.dirname(currentPath), newName);
      
      // First rename to temp to avoid conflicts
      await fs.rename(currentPath, tempPath);
      tempRenames.push({ tempPath, newPath, tempName, newName });
    }
    
    // Then rename from temp to final names
    for (const { tempPath, newPath } of tempRenames) {
      await fs.rename(tempPath, newPath);
    }
    
  } catch (error) {
    console.error('Error renaming files:', error);
    throw error;
  }
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

// Configure multer for Excel file uploads
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
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
      // Search for images recursively in subfolders using global function
      const imageResults = await findProductImagesGlobal(folderPath, productId);
      const productImages = imageResults.map(img => img.fileName);
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
      
      // Clear catalog cache so changes are reflected immediately
      if (req.app.locals.clearCatalogCache) {
        req.app.locals.clearCatalogCache();
      }
      
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

    // Clear catalog cache so changes are reflected immediately
    if (req.app.locals.clearCatalogCache) {
      req.app.locals.clearCatalogCache();
    }

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
    
    const targetImage = allImages.find(img => img.fileName === fileName);
    if (!targetImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Move the selected image to first position
    const reorderedImages = [targetImage, ...allImages.filter(img => img.fileName !== fileName)];

    // Update imageMap.ts with new order (no physical file renaming)
    await updateImageMap(productId, reorderedImages.map(img => img.fileName), folder);

    // Clear catalog cache so changes are reflected immediately
    if (req.app.locals.clearCatalogCache) {
      req.app.locals.clearCatalogCache();
    }

    // Force imageMap reload by clearing browser cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({ 
      success: true, 
      message: `Set ${fileName} as main image for product ${productId}`,
      files: reorderedImages.map(img => img.fileName)
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
    
    const currentIndex = allImages.findIndex(img => img.fileName === fileName);
    if (currentIndex <= 0) {
      return res.status(400).json({ error: 'Image is already first or not found' });
    }

    // Swap with previous image
    const reorderedImages = [...allImages];
    [reorderedImages[currentIndex - 1], reorderedImages[currentIndex]] = 
    [reorderedImages[currentIndex], reorderedImages[currentIndex - 1]];

    // Update imageMap.ts with new order (no physical file renaming)
    await updateImageMap(productId, reorderedImages.map(img => img.fileName), folder);

    // Clear catalog cache so changes are reflected immediately
    if (req.app.locals.clearCatalogCache) {
      req.app.locals.clearCatalogCache();
    }

    res.json({ 
      success: true, 
      message: `Moved ${fileName} up for product ${productId}`,
      files: reorderedImages.map(img => img.fileName)
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
    
    const currentIndex = allImages.findIndex(img => img.fileName === fileName);
    if (currentIndex < 0 || currentIndex >= allImages.length - 1) {
      return res.status(400).json({ error: 'Image is already last or not found' });
    }

    // Swap with next image
    const reorderedImages = [...allImages];
    [reorderedImages[currentIndex + 1], reorderedImages[currentIndex]] = 
    [reorderedImages[currentIndex], reorderedImages[currentIndex + 1]];

    // Update imageMap.ts with new order (no physical file renaming)
    await updateImageMap(productId, reorderedImages.map(img => img.fileName), folder);

    // Clear catalog cache so changes are reflected immediately
    if (req.app.locals.clearCatalogCache) {
      req.app.locals.clearCatalogCache();
    }

    res.json({ 
      success: true, 
      message: `Moved ${fileName} down for product ${productId}`,
      files: reorderedImages.map(img => img.fileName)
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

    // Update imageMap.ts with new order (no physical file renaming)
    await updateImageMap(productId, fileNames, folder);

    // Clear catalog cache so changes are reflected immediately
    if (req.app.locals.clearCatalogCache) {
      req.app.locals.clearCatalogCache();
    }

    res.json({ 
      success: true, 
      message: `Reordered ${fileNames.length} images for product ${productId}`,
      files: fileNames 
    });

  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({ error: 'Failed to reorder images' });
  }
});

// Rename image file
router.put('/rename-image', async (req, res) => {
  try {
    const { productId, folder, oldFileName, newFileName } = req.body;
    
    if (!productId || !folder || !oldFileName || !newFileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const folderPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', folder);
    const oldFilePath = path.join(folderPath, oldFileName);
    const newFilePath = path.join(folderPath, newFileName);
    
    // Check if old file exists
    try {
      await fs.access(oldFilePath);
    } catch {
      return res.status(404).json({ error: 'Original file not found' });
    }

    // Check if new filename already exists
    try {
      await fs.access(newFilePath);
      return res.status(409).json({ error: 'File with new name already exists' });
    } catch {
      // Good, new filename doesn't exist
    }

    // Rename the file
    await fs.rename(oldFilePath, newFilePath);

    // Get all current images for this product and update with new name
    const allImages = await findProductImagesGlobal(folderPath, productId);
    const updatedFileNames = allImages.map(img => 
      img.fileName === oldFileName ? newFileName : img.fileName
    );

    // Update imageMap.ts with new filename
    await updateImageMap(productId, updatedFileNames, folder);

    // Clear catalog cache so changes are reflected immediately
    if (req.app.locals.clearCatalogCache) {
      req.app.locals.clearCatalogCache();
    }

    res.json({ 
      success: true, 
      message: `Renamed ${oldFileName} to ${newFileName}`,
      oldFileName,
      newFileName,
      files: updatedFileNames
    });

  } catch (error) {
    console.error('Error renaming image:', error);
    res.status(500).json({ error: 'Failed to rename image' });
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

    // Create image paths relative to the imageMap.ts file
    const imagePaths = fileNames.map(fileName => `./${folder}/${fileName}`);
    
    // Find the staticImageMap declaration
    const staticMapStart = content.indexOf('const staticImageMap: Record<string, string[]> = {');
    const staticMapEnd = content.indexOf('};', staticMapStart);
    
    if (staticMapStart > -1 && staticMapEnd > -1) {
      const beforeMap = content.slice(0, staticMapStart);
      const afterMap = content.slice(staticMapEnd + 2);
      
      // Extract existing entries (if any)
      const mapContent = content.slice(staticMapStart, staticMapEnd + 2);
      
      // Check if product already exists
      const productMapRegex = new RegExp(`\\s*'${productId}':\\s*\\[[^\\]]*\\],?.*?\\n`, 'g');
      let updatedMapContent = mapContent.replace(productMapRegex, '');
      
      // Add the new/updated entry
      const newEntry = `  '${productId}': ${JSON.stringify(imagePaths)}, // Admin-set order for product ${productId}\n`;
      
      // Insert before the closing brace
      updatedMapContent = updatedMapContent.replace('};', `${newEntry}};`);
      
      content = beforeMap + updatedMapContent + afterMap;
      
      await fs.writeFile(imageMapPath, content, 'utf-8');
      
      // Force Node.js to invalidate the module cache for imageMap.ts
      // Note: In ESM, we can't directly clear require.cache, but file write should be enough
      // The frontend cache buster will handle client-side cache invalidation
      
      console.log(`Updated imageMap.ts: Set custom order for product ${productId} with ${fileNames.length} images`);
    } else {
      console.error('Could not find staticImageMap in imageMap.ts');
    }
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

// Salepoints Import/Export Routes
router.get('/salepoints/export', async (req, res) => {
  try {
    const XLSX = await import('xlsx');
    
    // Get storage instance from app
    const storage = req.app.locals.storage;
    if (!storage) {
      return res.status(500).json({ error: 'Storage not available' });
    }

    // Fetch all dealer locations
    const salepoints = await storage.getDealerLocations();
    
    if (salepoints.length === 0) {
      return res.status(404).json({ error: 'No salepoints to export' });
    }

    // Transform data for Excel export
    const exportData = salepoints.map((salepoint: any) => ({
      'Название магазина': salepoint.name,
      'Дистрибьютор': salepoint.region || '',
      'Город': salepoint.city,
      'Адрес': salepoint.address,
      'Региональный менеджер': '', // Could be derived from region or added as separate field
      'Телефон': salepoint.phone || '',
      'Email': salepoint.email || '',
      'Сайт': salepoint.website || '',
      'Координаты': `${salepoint.latitude},${salepoint.longitude}`,
      'Широта': salepoint.latitude,
      'Долгота': salepoint.longitude,
      'Тип точки': salepoint.dealerType,
      'Услуги': salepoint.services ? salepoint.services.join(',') : '',
      'Часы работы': salepoint.workingHours || '',
      'Активен': salepoint.isActive,
      'Порядок сортировки': salepoint.sortOrder
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 30 }, // Название магазина
      { wch: 20 }, // Дистрибьютор
      { wch: 15 }, // Город
      { wch: 40 }, // Адрес
      { wch: 25 }, // Региональный менеджер
      { wch: 15 }, // Телефон
      { wch: 25 }, // Email
      { wch: 30 }, // Сайт
      { wch: 20 }, // Координаты
      { wch: 12 }, // Широта
      { wch: 12 }, // Долгота
      { wch: 12 }, // Тип точки
      { wch: 30 }, // Услуги
      { wch: 20 }, // Часы работы
      { wch: 10 }, // Активен
      { wch: 15 }  // Порядок сортировки
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Точки продаж');
    
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Точки_продаж_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error exporting salepoints:', error);
    res.status(500).json({ error: 'Failed to export salepoints' });
  }
});

router.post('/salepoints/import', uploadExcel.any(), async (req, res) => {
  try {
    console.log('Starting salepoints import...');
    const XLSX = await import('xlsx');
    
    // Get storage instance from app
    const storage = req.app.locals.storage;
    if (!storage) {
      console.error('Storage not available');
      return res.status(500).json({ error: 'Storage not available' });
    }

    const files = req.files as Express.Multer.File[];
    const data = req.body.data;
    
    console.log('Files received:', files?.length || 0);
    console.log('Body data:', data ? 'present' : 'none');
    
    let salepointsToImport: any[] = [];
    
    if (files && files.length > 0) {
      // Process Excel file
      const file = files[0];
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Excel parsed, rows count:', jsonData.length);
      console.log('First row keys:', Object.keys(jsonData[0] || {}));
      console.log('First row data:', jsonData[0]);
      
      if (jsonData.length === 0) {
        return res.status(400).json({ error: 'Excel file is empty or has wrong format' });
      }

      // Transform Excel data to database format
      salepointsToImport = jsonData.map((row: any, index: number) => {
        // Parse coordinates
        let latitude = '0';
        let longitude = '0';
        
        if (row['Координаты']) {
          const coords = String(row['Координаты']).split(',');
          if (coords.length === 2) {
            latitude = coords[0].trim();
            longitude = coords[1].trim();
          }
        } else {
          latitude = String(row['Широта'] || '0').trim();
          longitude = String(row['Долгота'] || '0').trim();
        }

        // Parse services
        let services: string[] = [];
        if (row['Услуги']) {
          services = String(row['Услуги']).split(',').map((s: string) => s.trim()).filter((s: string) => s);
        }

        // Validate required fields
        const name = String(row['Название торговой точки'] || row['Название магазина'] || row['Название'] || '').trim();
        const city = String(row['Город'] || '').trim();
        const address = String(row['Адрес'] || '').trim();
        
        if (!name || !city || !address) {
          console.warn(`Skipping row ${index + 1}: missing required fields`);
          return null;
        }

        return {
          name,
          address,
          city,
          region: String(row['Регион'] || row['Дистрибьютор'] || '').trim(),
          phone: String(row['Телефон'] || '').trim() || null,
          email: String(row['Email'] || row['Э-почта'] || '').trim() || null,
          website: String(row['Сайт'] || row['Веб-сайт'] || '').trim() || null,
          latitude: latitude || '0',
          longitude: longitude || '0',
          dealerType: String(row['Тип точки'] || 'retail').trim().toLowerCase(),
          services: services,
          workingHours: String(row['Часы работы'] || row['График работы'] || '').trim() || null,
          isActive: parseInt(String(row['Активен'] || '1')) || 1,
          sortOrder: parseInt(String(row['Порядок сортировки'] || index)) || index,
        };
      }).filter(Boolean); // Remove null entries
      
    } else if (data) {
      // Process JSON data sent from frontend
      try {
        salepointsToImport = JSON.parse(data);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON data format' });
      }
    } else {
      return res.status(400).json({ error: 'No file or data provided' });
    }

    if (salepointsToImport.length === 0) {
      return res.status(400).json({ error: 'No valid salepoints to import' });
    }

    console.log(`Importing ${salepointsToImport.length} salepoints...`);

    // Clear existing data before import (replace mode)
    try {
      const existingLocations = await storage.getDealerLocations();
      console.log(`Clearing ${existingLocations.length} existing dealer locations...`);
      
      // Use bulk delete for better reliability
      const deletedCount = await storage.clearAllDealerLocations();
      console.log(`Successfully cleared ${deletedCount} dealer locations`);
      
      // Verify clearing was successful
      const remainingLocations = await storage.getDealerLocations();
      console.log(`Remaining locations after clearing: ${remainingLocations.length}`);
      
      if (remainingLocations.length > 0) {
        console.warn(`Warning: ${remainingLocations.length} locations were not cleared properly`);
      }
      
    } catch (error) {
      console.error('Error clearing existing data:', error);
      // Continue with import even if clearing fails
    }

    // Import salepoints to database
    let importedCount = 0;
    const errors: string[] = [];

    for (const salepointData of salepointsToImport) {
      try {
        await storage.createDealerLocation(salepointData);
        importedCount++;
      } catch (error) {
        console.error('Error importing salepoint:', error);
        errors.push(`Failed to import ${salepointData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.json({
      success: true,
      imported: importedCount,
      total: salepointsToImport.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error importing salepoints:', error);
    res.status(500).json({ error: 'Failed to import salepoints' });
  }
});

export default router;