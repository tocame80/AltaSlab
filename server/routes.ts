import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCertificateSchema, insertVideoInstructionSchema } from "@shared/schema";
import adminRoutes from "./routes/admin";

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

  const httpServer = createServer(app);

  return httpServer;
}
