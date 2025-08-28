import type { Express } from "express";
import express from "express";
import path from "path";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCertificateSchema, insertVideoInstructionSchema, insertHeroImageSchema, insertGalleryProjectSchema, insertDealerLocationSchema, insertCatalogProductSchema, catalogProducts, galleryProjects } from "@shared/schema";
import adminRoutes from "./routes/admin";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin routes for image management
  app.use('/api/admin', adminRoutes);

  // Simple test endpoint to check if API routing works
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'API is working!', 
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  // Debug endpoint for production troubleshooting
  app.get('/api/debug/status', async (req, res) => {
    try {
      const dbStatus: {
        connected: boolean;
        tablesExist: {
          catalogProducts?: boolean;
          galleryProjects?: boolean;
        };
        error: string | null;
      } = {
        connected: false,
        tablesExist: {},
        error: null
      };
      
      try {
        // Test basic database connection
        const testQuery = await db.execute(sql`SELECT 1 as test`);
        dbStatus.connected = true;
        
        // Test each table existence
        try {
          await db.select().from(catalogProducts).limit(1);
          dbStatus.tablesExist.catalogProducts = true;
        } catch (e: any) {
          dbStatus.tablesExist.catalogProducts = false;
          dbStatus.error = e.message;
        }
        
        try {
          await db.select().from(galleryProjects).limit(1);
          dbStatus.tablesExist.galleryProjects = true;
        } catch (e: any) {
          dbStatus.tablesExist.galleryProjects = false;
        }
        
      } catch (error: any) {
        dbStatus.error = error.message;
      }
      
      res.json({
        environment: process.env.NODE_ENV || 'unknown',
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
        dbStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Debug endpoint failed',
        message: error.message 
      });
    }
  });

  // Certificate routes
  app.get('/api/certificates', async (req, res) => {
    try {
      const certificates = await storage.getCertificates();
      res.json(certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: 'Failed to fetch certificates' });
    }
  });

  app.post('/api/certificates', async (req, res) => {
    try {
      const certificateData = insertCertificateSchema.parse(req.body);
      const certificate = await storage.createCertificate(certificateData);
      res.status(201).json(certificate);
    } catch (error) {
      console.error('Error creating certificate:', error);
      res.status(400).json({ message: 'Failed to create certificate' });
    }
  });

  app.put('/api/certificates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertCertificateSchema.partial().parse(req.body);
      const certificate = await storage.updateCertificate(id, updates);
      res.json(certificate);
    } catch (error) {
      console.error('Error updating certificate:', error);
      res.status(400).json({ message: 'Failed to update certificate' });
    }
  });

  app.delete('/api/certificates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCertificate(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      res.status(500).json({ message: 'Failed to delete certificate' });
    }
  });

  // Video instruction routes
  app.get('/api/video-instructions', async (req, res) => {
    try {
      const videoInstructions = await storage.getVideoInstructions();
      res.json(videoInstructions);
    } catch (error) {
      console.error('Error fetching video instructions:', error);
      res.status(500).json({ message: 'Failed to fetch video instructions' });
    }
  });

  app.post('/api/video-instructions', async (req, res) => {
    try {
      const videoData = insertVideoInstructionSchema.parse(req.body);
      const videoInstruction = await storage.createVideoInstruction(videoData);
      res.status(201).json(videoInstruction);
    } catch (error) {
      console.error('Error creating video instruction:', error);
      res.status(400).json({ message: 'Failed to create video instruction' });
    }
  });

  app.put('/api/video-instructions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertVideoInstructionSchema.partial().parse(req.body);
      const videoInstruction = await storage.updateVideoInstruction(id, updates);
      res.json(videoInstruction);
    } catch (error) {
      console.error('Error updating video instruction:', error);
      res.status(400).json({ message: 'Failed to update video instruction' });
    }
  });

  app.delete('/api/video-instructions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVideoInstruction(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting video instruction:', error);
      res.status(500).json({ message: 'Failed to delete video instruction' });
    }
  });

  // Gallery project routes
  app.get('/api/gallery-projects', async (req, res) => {
    try {
      console.log('API: Fetching gallery projects...');
      const galleryProjects = await storage.getGalleryProjects();
      console.log('API: Successfully fetched', galleryProjects.length, 'gallery projects');
      res.json(galleryProjects);
    } catch (error: any) {
      console.error('Error fetching gallery projects:', error);
      console.error('Gallery projects error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ 
        message: 'Failed to fetch gallery projects',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  app.post('/api/gallery-projects', async (req, res) => {
    try {
      console.log('Received gallery project data:', req.body);
      const projectData = insertGalleryProjectSchema.parse(req.body);
      console.log('Parsed gallery project data:', projectData);
      const galleryProject = await storage.createGalleryProject(projectData);
      console.log('Created gallery project:', galleryProject);
      res.status(201).json(galleryProject);
    } catch (error) {
      console.error('Error creating gallery project:', error);
      res.status(400).json({ message: 'Failed to create gallery project' });
    }
  });

  app.put('/api/gallery-projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertGalleryProjectSchema.partial().parse(req.body);
      const galleryProject = await storage.updateGalleryProject(id, updates);
      res.json(galleryProject);
    } catch (error) {
      console.error('Error updating gallery project:', error);
      res.status(400).json({ message: 'Failed to update gallery project' });
    }
  });

  app.delete('/api/gallery-projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGalleryProject(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting gallery project:', error);
      res.status(500).json({ message: 'Failed to delete gallery project' });
    }
  });

  // Dealer location routes
  app.get('/api/dealer-locations', async (req, res) => {
    try {
      const dealerLocations = await storage.getDealerLocations();
      res.json(dealerLocations);
    } catch (error) {
      console.error('Error fetching dealer locations:', error);
      res.status(500).json({ message: 'Failed to fetch dealer locations' });
    }
  });

  app.post('/api/dealer-locations', async (req, res) => {
    try {
      const dealerData = insertDealerLocationSchema.parse(req.body);
      const dealerLocation = await storage.createDealerLocation(dealerData);
      res.status(201).json(dealerLocation);
    } catch (error) {
      console.error('Error creating dealer location:', error);
      res.status(400).json({ message: 'Failed to create dealer location' });
    }
  });

  app.put('/api/dealer-locations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertDealerLocationSchema.partial().parse(req.body);
      const dealerLocation = await storage.updateDealerLocation(id, updates);
      res.json(dealerLocation);
    } catch (error) {
      console.error('Error updating dealer location:', error);
      res.status(400).json({ message: 'Failed to update dealer location' });
    }
  });

  app.delete('/api/dealer-locations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDealerLocation(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting dealer location:', error);
      res.status(500).json({ message: 'Failed to delete dealer location' });
    }
  });

  // In-memory cache for catalog products
  let catalogCache: any[] | null = null;
  let cacheTimestamp = 0;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Catalog product routes - with LOCAL images only
  app.get('/api/catalog-products', async (req, res) => {
    try {
      console.log('API: /catalog-products request started');
      
      // Check if cache is valid
      const now = Date.now();
      if (catalogCache && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('API: Serving catalog from cache');
        res.json(catalogCache);
        return;
      }

      // Устанавливаем заголовки для клиентского кеширования (30 секунд)
      res.set({
        'Cache-Control': 'public, max-age=30',
        'ETag': `catalog-${now}`
      });
      
      console.log('API: Attempting to fetch products from storage...');
      const catalogProducts = await storage.getCatalogProducts();
      console.log('API: Got', catalogProducts.length, 'products from storage');
      
      // Filter out collection headers (AUTO_ entries) - internal system information
      const realProducts = catalogProducts.filter(product => 
        product.productCode && product.productCode.startsWith('SPC')
      );
      
      console.log('API: After filtering AUTO_ headers:', realProducts.length, 'real products with LOCAL images');
      
      // Transform products to use only local images
      const transformedProducts = realProducts.map(product => {
        const productId = product.productCode?.replace('SPC', '') || product.productCode;
        const localImages = getLocalProductImages(productId, product.collection || '');
        

        
        return {
          ...product,
          // Override with local image signals
          image: localImages.image,
          gallery: localImages.gallery,
          // Remove external images from database
          images: undefined,
          // Ensure numeric types are properly converted
          price: product.price ? parseFloat(product.price.toString()) : 0,
          areaPerPackage: product.areaPerPackage ? parseFloat(product.areaPerPackage.toString()) : null,
          pcsPerPackage: product.pcsPerPackage ? parseFloat(product.pcsPerPackage.toString()) : null,
          quantity: product.quantity ? parseInt(product.quantity.toString()) : 0
        };
      });
      
      // Update cache
      catalogCache = transformedProducts;
      cacheTimestamp = now;
      console.log('API: Generated and cached', transformedProducts.length, 'products');
      
      res.json(transformedProducts);
    } catch (error: any) {
      console.error('Error fetching catalog products:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ 
        message: 'Failed to fetch catalog products',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  // Get local product images only - no external links
  const getLocalProductImages = (productId: string, collection: string) => {
    const cleanId = productId?.replace('SPC', '') || productId;
    
    // All images will be handled by frontend imageMap.ts
    // Return signal for frontend to use imageMap functions
    return {
      image: `USE_IMAGEMAP:${cleanId}`,
      gallery: [`USE_IMAGEMAP:${cleanId}`]
    };
  };

  // Public API for website product catalog (returns products in format expected by frontend)
  app.get('/api/products', async (req, res) => {
    try {
      const catalogProducts = await storage.getCatalogProducts();
      
      // Filter out collection headers (AUTO_ entries) - internal system information  
      const realProducts = catalogProducts.filter(product => 
        product.productCode && product.productCode.startsWith('SPC')
      );
      console.log('API /products: returning', realProducts.length, 'real products');
      
      // Transform database products to frontend format using local images
      const frontendProducts = realProducts.map(product => {
        const productId = product.productCode?.replace('SPC', '') || product.productCode;
        const localImages = getLocalProductImages(productId, product.collection || '');
        
        return {
          id: product.productCode,
          name: product.name,
          collection: product.collection || '',
          design: product.color || '',
          format: product.format || '',
          price: parseFloat(product.price || '0'),
          areaPerPackage: product.areaPerPackage ? parseFloat(product.areaPerPackage.toString()) : null,
          pcsPerPackage: product.pcsPerPackage ? parseFloat(product.pcsPerPackage.toString()) : null,
          image: localImages.image,
          category: product.category === 'SPC панели' ? 'concrete' : 'other',
          surface: product.surface || 'упак',
          color: product.color || '',
          barcode: product.barcode || '',
          gallery: localImages.gallery,
          specifications: product.specifications || {},
          availability: {
            inStock: (product.quantity || 0) > 0,
            deliveryTime: product.availability === 'В наличии' ? '1-3 дня' : '7-10 дней',
            quantity: product.quantity || 0
          }
        };
      });
      
      res.json(frontendProducts);
    } catch (error) {
      console.error('Error fetching products for frontend:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/catalog-products', async (req, res) => {
    try {
      const productData = insertCatalogProductSchema.parse(req.body);
      const catalogProduct = await storage.createCatalogProduct(productData);
      res.status(201).json(catalogProduct);
    } catch (error) {
      console.error('Error creating catalog product:', error);
      res.status(400).json({ message: 'Failed to create catalog product' });
    }
  });

  app.put('/api/catalog-products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertCatalogProductSchema.partial().parse(req.body);
      const catalogProduct = await storage.updateCatalogProduct(id, updates);
      res.json(catalogProduct);
    } catch (error) {
      console.error('Error updating catalog product:', error);
      res.status(400).json({ message: 'Failed to update catalog product' });
    }
  });

  app.delete('/api/catalog-products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCatalogProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting catalog product:', error);
      res.status(500).json({ message: 'Failed to delete catalog product' });
    }
  });

  // Import/export routes for catalog
  app.post('/api/catalog-products/import', async (req, res) => {
    try {
      const { products } = req.body;
      console.log('Starting catalog import, received products:', products?.length || 0);
      
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Products must be an array' });
      }
      
      console.log('Validating products with schema...');
      const validatedProducts = products.map((product, index) => {
        try {
          return insertCatalogProductSchema.parse(product);
        } catch (error) {
          console.error(`Validation error for product ${index}:`, error);
          console.error('Product data:', product);
          throw error;
        }
      });
      
      console.log('Products validated, importing to storage...');
      const result = await storage.importCatalogProducts(validatedProducts);
      console.log(`Import successful: ${result.length} products processed`);
      
      res.json({ 
        message: `Successfully imported ${result.length} products`,
        products: result 
      });
    } catch (error) {
      console.error('Error importing catalog products:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(400).json({ 
        message: 'Failed to import catalog products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/catalog-products/export', async (req, res) => {
    try {
      const products = await storage.exportCatalogProducts();
      res.json(products);
    } catch (error) {
      console.error('Error exporting catalog products:', error);
      res.status(500).json({ message: 'Failed to export catalog products' });
    }
  });

  // Object Storage routes for file upload
  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  });

  // Hero images upload route - organized in hero folder
  app.post("/api/hero-images/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getHeroImageUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting hero image upload URL:', error);
      res.status(500).json({ error: 'Failed to get hero image upload URL' });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Set object ACL after upload for hero images
  app.put("/api/hero-images/set-acl", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      
      // Normalize the path to ensure it goes to hero folder
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      // Replace 'uploads' with 'hero' for organized storage
      const heroPath = normalizedPath.replace('/uploads/', '/hero/');
      
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: "admin",
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: heroPath,
        originalPath: objectPath,
        success: true,
      });
    } catch (error) {
      console.error("Error setting hero image ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Hero images routes
  app.get('/api/hero-images', async (req, res) => {
    try {
      const heroImages = await storage.getHeroImages();
      res.json(heroImages);
    } catch (error) {
      console.error('Error fetching hero images:', error);
      res.status(500).json({ message: 'Failed to fetch hero images' });
    }
  });

  app.post('/api/hero-images', async (req, res) => {
    try {
      const imageData = insertHeroImageSchema.parse(req.body);
      const heroImage = await storage.createHeroImage(imageData);
      res.status(201).json(heroImage);
    } catch (error) {
      console.error('Error creating hero image:', error);
      res.status(400).json({ message: 'Failed to create hero image' });
    }
  });

  app.put('/api/hero-images/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertHeroImageSchema.partial().parse(req.body);
      const heroImage = await storage.updateHeroImage(id, updates);
      res.json(heroImage);
    } catch (error) {
      console.error('Error updating hero image:', error);
      res.status(400).json({ message: 'Failed to update hero image' });
    }
  });

  app.delete('/api/hero-images/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteHeroImage(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting hero image:', error);
      res.status(500).json({ message: 'Failed to delete hero image' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
