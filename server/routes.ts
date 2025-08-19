import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import adminRoutes from "./routes/admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin routes for image management
  app.use('/api/admin', adminRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
