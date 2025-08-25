import { type User, type InsertUser, type Certificate, type InsertCertificate, type VideoInstruction, type InsertVideoInstruction, type HeroImage, type InsertHeroImage, type GalleryProject, type InsertGalleryProject, type DealerLocation, type InsertDealerLocation, users, certificates, videoInstructions, heroImages, galleryProjects, dealerLocations } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Certificate methods
  getCertificates(): Promise<Certificate[]>;
  getCertificate(id: string): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: string, certificate: Partial<InsertCertificate>): Promise<Certificate>;
  deleteCertificate(id: string): Promise<void>;
  
  // Video instruction methods
  getVideoInstructions(): Promise<VideoInstruction[]>;
  getVideoInstruction(id: string): Promise<VideoInstruction | undefined>;
  createVideoInstruction(videoInstruction: InsertVideoInstruction): Promise<VideoInstruction>;
  updateVideoInstruction(id: string, videoInstruction: Partial<InsertVideoInstruction>): Promise<VideoInstruction>;
  deleteVideoInstruction(id: string): Promise<void>;
  
  // Hero image methods
  getHeroImages(): Promise<HeroImage[]>;
  getHeroImage(id: string): Promise<HeroImage | undefined>;
  createHeroImage(heroImage: InsertHeroImage): Promise<HeroImage>;
  updateHeroImage(id: string, heroImage: Partial<InsertHeroImage>): Promise<HeroImage>;
  deleteHeroImage(id: string): Promise<void>;
  
  // Gallery project methods
  getGalleryProjects(): Promise<GalleryProject[]>;
  getGalleryProject(id: string): Promise<GalleryProject | undefined>;
  createGalleryProject(galleryProject: InsertGalleryProject): Promise<GalleryProject>;
  updateGalleryProject(id: string, galleryProject: Partial<InsertGalleryProject>): Promise<GalleryProject>;
  deleteGalleryProject(id: string): Promise<void>;
  
  // Dealer location methods
  getDealerLocations(): Promise<DealerLocation[]>;
  getDealerLocation(id: string): Promise<DealerLocation | undefined>;
  createDealerLocation(dealerLocation: InsertDealerLocation): Promise<DealerLocation>;
  updateDealerLocation(id: string, dealerLocation: Partial<InsertDealerLocation>): Promise<DealerLocation>;
  deleteDealerLocation(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Certificate methods
  async getCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates).orderBy(asc(certificates.sortOrder));
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate || undefined;
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db
      .insert(certificates)
      .values(insertCertificate)
      .returning();
    return certificate;
  }

  async updateCertificate(id: string, updates: Partial<InsertCertificate>): Promise<Certificate> {
    const [certificate] = await db
      .update(certificates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(certificates.id, id))
      .returning();
    return certificate;
  }

  async deleteCertificate(id: string): Promise<void> {
    await db.delete(certificates).where(eq(certificates.id, id));
  }

  // Video instruction methods
  async getVideoInstructions(): Promise<VideoInstruction[]> {
    return await db.select().from(videoInstructions).orderBy(asc(videoInstructions.sortOrder));
  }

  async getVideoInstruction(id: string): Promise<VideoInstruction | undefined> {
    const [videoInstruction] = await db.select().from(videoInstructions).where(eq(videoInstructions.id, id));
    return videoInstruction || undefined;
  }

  async createVideoInstruction(insertVideoInstruction: InsertVideoInstruction): Promise<VideoInstruction> {
    const [videoInstruction] = await db
      .insert(videoInstructions)
      .values(insertVideoInstruction)
      .returning();
    return videoInstruction;
  }

  async updateVideoInstruction(id: string, updates: Partial<InsertVideoInstruction>): Promise<VideoInstruction> {
    const [videoInstruction] = await db
      .update(videoInstructions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videoInstructions.id, id))
      .returning();
    return videoInstruction;
  }

  async deleteVideoInstruction(id: string): Promise<void> {
    await db.delete(videoInstructions).where(eq(videoInstructions.id, id));
  }

  // Hero image methods
  async getHeroImages(): Promise<HeroImage[]> {
    return await db.select().from(heroImages).where(eq(heroImages.isActive, 1)).orderBy(asc(heroImages.sortOrder));
  }

  async getHeroImage(id: string): Promise<HeroImage | undefined> {
    const [heroImage] = await db.select().from(heroImages).where(eq(heroImages.id, id));
    return heroImage || undefined;
  }

  async createHeroImage(insertHeroImage: InsertHeroImage): Promise<HeroImage> {
    const [heroImage] = await db
      .insert(heroImages)
      .values(insertHeroImage)
      .returning();
    return heroImage;
  }

  async updateHeroImage(id: string, updates: Partial<InsertHeroImage>): Promise<HeroImage> {
    const [heroImage] = await db
      .update(heroImages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(heroImages.id, id))
      .returning();
    return heroImage;
  }

  async deleteHeroImage(id: string): Promise<void> {
    await db.delete(heroImages).where(eq(heroImages.id, id));
  }

  // Gallery project methods
  async getGalleryProjects(): Promise<GalleryProject[]> {
    return await db.select().from(galleryProjects).where(eq(galleryProjects.isActive, 1)).orderBy(asc(galleryProjects.sortOrder));
  }

  async getGalleryProject(id: string): Promise<GalleryProject | undefined> {
    const [galleryProject] = await db.select().from(galleryProjects).where(eq(galleryProjects.id, id));
    return galleryProject || undefined;
  }

  async createGalleryProject(insertGalleryProject: InsertGalleryProject): Promise<GalleryProject> {
    const [galleryProject] = await db
      .insert(galleryProjects)
      .values([insertGalleryProject])
      .returning();
    return galleryProject;
  }

  async updateGalleryProject(id: string, updates: Partial<InsertGalleryProject>): Promise<GalleryProject> {
    const [galleryProject] = await db
      .update(galleryProjects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(galleryProjects.id, id))
      .returning();
    return galleryProject;
  }

  async deleteGalleryProject(id: string): Promise<void> {
    await db.delete(galleryProjects).where(eq(galleryProjects.id, id));
  }

  // Dealer location methods
  async getDealerLocations(): Promise<DealerLocation[]> {
    return await db.select().from(dealerLocations).where(eq(dealerLocations.isActive, 1)).orderBy(asc(dealerLocations.sortOrder));
  }

  async getDealerLocation(id: string): Promise<DealerLocation | undefined> {
    const [dealerLocation] = await db.select().from(dealerLocations).where(eq(dealerLocations.id, id));
    return dealerLocation || undefined;
  }

  async createDealerLocation(insertDealerLocation: InsertDealerLocation): Promise<DealerLocation> {
    const [dealerLocation] = await db
      .insert(dealerLocations)
      .values([insertDealerLocation])
      .returning();
    return dealerLocation;
  }

  async updateDealerLocation(id: string, updates: Partial<InsertDealerLocation>): Promise<DealerLocation> {
    const [dealerLocation] = await db
      .update(dealerLocations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dealerLocations.id, id))
      .returning();
    return dealerLocation;
  }

  async deleteDealerLocation(id: string): Promise<void> {
    await db.delete(dealerLocations).where(eq(dealerLocations.id, id));
  }
}

export const storage = new DatabaseStorage();
