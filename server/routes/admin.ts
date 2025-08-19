import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

const router = Router();

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
    
    try {
      const files = await fs.readdir(folderPath);
      const productImages = files.filter(file => 
        file.startsWith(`${productId}-`) && 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      
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

export default router;