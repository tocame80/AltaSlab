import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCertificateSchema, insertVideoInstructionSchema, insertHeroImageSchema } from "@shared/schema";
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

  // Hero images routes - DEPRECATED: Now using local assets
  // These routes are kept for backward compatibility but not actively used
  /*
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
  */

  const httpServer = createServer(app);

  return httpServer;
}
