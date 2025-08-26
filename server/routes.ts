import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCertificateSchema, insertVideoInstructionSchema, insertHeroImageSchema, insertGalleryProjectSchema, insertDealerLocationSchema, insertCatalogProductSchema } from "@shared/schema";
import adminRoutes from "./routes/admin";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin routes for image management
  app.use('/api/admin', adminRoutes);

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
      const galleryProjects = await storage.getGalleryProjects();
      res.json(galleryProjects);
    } catch (error) {
      console.error('Error fetching gallery projects:', error);
      res.status(500).json({ message: 'Failed to fetch gallery projects' });
    }
  });

  app.post('/api/gallery-projects', async (req, res) => {
    try {
      const projectData = insertGalleryProjectSchema.parse(req.body);
      const galleryProject = await storage.createGalleryProject(projectData);
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

  // Catalog product routes
  app.get('/api/catalog-products', async (req, res) => {
    try {
      const catalogProducts = await storage.getCatalogProducts();
      res.json(catalogProducts);
    } catch (error) {
      console.error('Error fetching catalog products:', error);
      res.status(500).json({ message: 'Failed to fetch catalog products' });
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
      if (!Array.isArray(products)) {
        return res.status(400).json({ message: 'Products must be an array' });
      }
      
      const validatedProducts = products.map(product => insertCatalogProductSchema.parse(product));
      const result = await storage.importCatalogProducts(validatedProducts);
      res.json({ 
        message: `Successfully imported ${result.length} products`,
        products: result 
      });
    } catch (error) {
      console.error('Error importing catalog products:', error);
      res.status(400).json({ message: 'Failed to import catalog products' });
    }
  });

  app.get('/api/catalog-products/export', async (req, res) => {
    try {
      // Return sample catalog data based on existing product catalog
      const sampleProducts = [
        {
          productCode: 'SPC8934',
          name: 'Панель SPC стеновая Альта Слэб Магия Бетона 300×600×2,4мм Закат',
          unit: 'упак',
          quantity: 245,
          price: 4739.04,
          barcode: '4650218304115',
          images: ['https://alta-slab.ru/images/spc-8934-zahat.jpg'],
          sortOrder: 1,
          isActive: 1
        },
        {
          productCode: 'SPC8938',
          name: 'Панель SPC стеновая Альта Слэб Магия Бетона 600×1200×2,4мм Закат',
          unit: 'упак',
          quantity: 0,
          price: 5528.88,
          barcode: '4650218304092',
          images: ['https://alta-slab.ru/images/spc-8938-zahat.jpg'],
          sortOrder: 2,
          isActive: 0
        },
        {
          productCode: 'SPC8930',
          name: 'Панель SPC стеновая Альта Слэб Магия Бетона 300×600×2,4мм Метеорит',
          unit: 'упак',
          quantity: 150,
          price: 4739.04,
          barcode: '4650218304030',
          images: ['https://alta-slab.ru/images/spc-8930-meteorit.jpg'],
          sortOrder: 3,
          isActive: 1
        },
        {
          productCode: 'SPC9014',
          name: 'Панель SPC стеновая Альта Слэб Текстиль 300×600×2,4мм Лён',
          unit: 'упак',
          quantity: 80,
          price: 4739.04,
          barcode: '4650218304245',
          images: ['https://alta-slab.ru/images/spc-9014-len.jpg'],
          sortOrder: 4,
          isActive: 1
        },
        {
          productCode: 'SPC9050',
          name: 'Панель SPC стеновая Альта Слэб Матовая 300×600×2,4мм Ясень',
          unit: 'упак',
          quantity: 120,
          price: 4530.72,
          barcode: '4650218304375',
          images: ['https://alta-slab.ru/images/spc-9050-ash.jpg'],
          sortOrder: 5,
          isActive: 1
        },
        {
          productCode: 'SPC9086',
          name: 'Панель SPC стеновая Альта Слэб Мрамор 300×600×2,4мм Каррара',
          unit: 'упак',
          quantity: 90,
          price: 5320.56,
          barcode: '4650218304520',
          images: ['https://alta-slab.ru/images/spc-9086-carrara.jpg'],
          sortOrder: 6,
          isActive: 1
        }
      ];
      
      res.json(sampleProducts);
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
