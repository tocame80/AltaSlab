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

// Function to update imageMap.ts
async function updateImageMap(productId: string, fileNames: string[], folder: string) {
  const imageMapPath = path.join(process.cwd(), 'client', 'src', 'assets', 'products', 'imageMap.ts');
  
  try {
    // Read current imageMap content
    let content = await fs.readFile(imageMapPath, 'utf-8');

    // Add import statements
    const imports = fileNames.map((fileName, index) => {
      const varName = `${productId}_${index + 1}`;
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
    const varNames = fileNames.map((_, index) => `${productId}_${index + 1}`);
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

export default router;