import { type User, type InsertUser, type Certificate, type InsertCertificate, users, certificates } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
