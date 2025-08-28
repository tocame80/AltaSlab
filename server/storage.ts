import { type User, type InsertUser, type Certificate, type InsertCertificate, type VideoInstruction, type InsertVideoInstruction, type HeroImage, type InsertHeroImage, type GalleryProject, type InsertGalleryProject, type DealerLocation, type InsertDealerLocation, type CatalogProduct, type InsertCatalogProduct, users, certificates, videoInstructions, heroImages, galleryProjects, dealerLocations, catalogProducts } from "@shared/schema";
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
  
  // Catalog product methods
  getCatalogProducts(): Promise<CatalogProduct[]>;
  getCatalogProduct(id: string): Promise<CatalogProduct | undefined>;
  getCatalogProductByCode(productCode: string): Promise<CatalogProduct | undefined>;
  createCatalogProduct(catalogProduct: InsertCatalogProduct): Promise<CatalogProduct>;
  updateCatalogProduct(id: string, catalogProduct: Partial<InsertCatalogProduct>): Promise<CatalogProduct>;
  deleteCatalogProduct(id: string): Promise<void>;
  importCatalogProducts(products: InsertCatalogProduct[]): Promise<CatalogProduct[]>;
  exportCatalogProducts(): Promise<CatalogProduct[]>;
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
    try {
      console.log('DatabaseStorage: Attempting to query galleryProjects table...');
      // Try without isActive filter first in case column doesn't exist  
      const result = await db.select().from(galleryProjects).orderBy(asc(galleryProjects.sortOrder));
      console.log('DatabaseStorage: Successfully queried galleryProjects, got', result.length, 'projects');
      // Filter active projects in application layer as fallback
      return result.filter(p => p.isActive !== 0);
    } catch (error: any) {
      console.error('DatabaseStorage: Error querying galleryProjects:', error);
      console.log('DatabaseStorage: Using static fallback data for gallery projects');
      return this.getFallbackGalleryProjects();
    }
  }

  getFallbackGalleryProjects(): GalleryProject[] {
    // Return minimal static gallery data for production fallback
    return [
      {
        id: "fallback-project-1",
        title: "Современная квартира",
        description: "Стильный интерьер с панелями АЛЬТА СЛЭБ",
        application: "interior",
        images: ["/assets/gallery/gallery-1.jpg", "/assets/gallery/gallery-2.jpg"],
        materialsUsed: ["8934", "8930"],
        location: "Москва",
        area: "85 кв.м",
        year: "2024",
        isActive: 1,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async getGalleryProject(id: string): Promise<GalleryProject | undefined> {
    const [galleryProject] = await db.select().from(galleryProjects).where(eq(galleryProjects.id, id));
    return galleryProject || undefined;
  }

  async createGalleryProject(insertGalleryProject: InsertGalleryProject): Promise<GalleryProject> {
    console.log('Storage: Creating gallery project with data:', insertGalleryProject);
    const [galleryProject] = await db
      .insert(galleryProjects)
      .values(insertGalleryProject as any)
      .returning();
    console.log('Storage: Created gallery project:', galleryProject);
    return galleryProject;
  }

  async updateGalleryProject(id: string, updates: Partial<InsertGalleryProject>): Promise<GalleryProject> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    const [galleryProject] = await db
      .update(galleryProjects)
      .set(updateData)
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
      .values(insertDealerLocation as any)
      .returning();
    return dealerLocation;
  }

  async updateDealerLocation(id: string, updates: Partial<InsertDealerLocation>): Promise<DealerLocation> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    const [dealerLocation] = await db
      .update(dealerLocations)
      .set(updateData)
      .where(eq(dealerLocations.id, id))
      .returning();
    return dealerLocation;
  }

  async deleteDealerLocation(id: string): Promise<void> {
    await db.delete(dealerLocations).where(eq(dealerLocations.id, id));
  }

  // Catalog product methods
  async getCatalogProducts(): Promise<CatalogProduct[]> {
    try {
      console.log('DatabaseStorage: Attempting to query catalogProducts table...');
      // Try without isActive filter first in case column doesn't exist
      const result = await db.select().from(catalogProducts).orderBy(asc(catalogProducts.sortOrder));
      console.log('DatabaseStorage: Successfully queried catalogProducts, got', result.length, 'products');
      // Filter active products in application layer as fallback
      return result.filter(p => p.isActive !== 0);
    } catch (error: any) {
      console.error('DatabaseStorage: Error querying catalogProducts:', error);
      console.log('DatabaseStorage: Using static fallback data for catalog products');
      return this.getFallbackCatalogProducts();
    }
  }

  getFallbackCatalogProducts(): CatalogProduct[] {
    // Return minimal static catalog data for production fallback
    return [
      {
        id: "8934",
        productCode: "8934", 
        name: "Магия Бетона ЗАКАТ",
        collection: "concrete", 
        color: "Серый",
        surface: "Матовая",
        format: "300×600×2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "2850",
        barcode: null,
        category: "АЛЬТА СЛЭБ",
        format: "300×600×2,4мм",
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        availability: "В наличии",
        isActive: 1,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "8930",
        productCode: "8930",
        name: "Магия Бетона МЕТЕОРИТ",
        collection: "concrete",
        color: "Темно-серый", 
        surface: "Матовая",
        format: "300×600×2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "2850",
        barcode: null,
        category: "АЛЬТА СЛЭБ",
        format: "300×600×2,4мм",
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        availability: "В наличии",
        isActive: 1,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  async getCatalogProduct(id: string): Promise<CatalogProduct | undefined> {
    const [catalogProduct] = await db.select().from(catalogProducts).where(eq(catalogProducts.id, id));
    return catalogProduct || undefined;
  }

  async getCatalogProductByCode(productCode: string): Promise<CatalogProduct | undefined> {
    const [catalogProduct] = await db.select().from(catalogProducts).where(eq(catalogProducts.productCode, productCode));
    return catalogProduct || undefined;
  }

  async createCatalogProduct(insertCatalogProduct: InsertCatalogProduct): Promise<CatalogProduct> {
    const [catalogProduct] = await db
      .insert(catalogProducts)
      .values(insertCatalogProduct as any)
      .returning();
    return catalogProduct;
  }

  async updateCatalogProduct(id: string, updates: Partial<InsertCatalogProduct>): Promise<CatalogProduct> {
    const updateData: any = { ...updates, updatedAt: new Date() };
    const [catalogProduct] = await db
      .update(catalogProducts)
      .set(updateData)
      .where(eq(catalogProducts.id, id))
      .returning();
    return catalogProduct;
  }

  async deleteCatalogProduct(id: string): Promise<void> {
    await db.delete(catalogProducts).where(eq(catalogProducts.id, id));
  }

  async importCatalogProducts(products: InsertCatalogProduct[]): Promise<CatalogProduct[]> {
    const results: CatalogProduct[] = [];
    console.log(`Starting storage import for ${products.length} products`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing product ${i + 1}/${products.length}: ${product.productCode}`);
      
      try {
        // Check if product already exists by code
        const existing = await this.getCatalogProductByCode(product.productCode);
        if (existing) {
          console.log(`Updating existing product: ${product.productCode}`);
          // Update existing product
          const updated = await this.updateCatalogProduct(existing.id, product);
          results.push(updated);
        } else {
          console.log(`Creating new product: ${product.productCode}`);
          // Create new product
          const created = await this.createCatalogProduct(product);
          results.push(created);
        }
      } catch (error) {
        console.error(`Error processing product ${product.productCode}:`, error);
        console.error('Product data:', product);
        throw error;
      }
    }
    
    console.log(`Storage import complete: ${results.length} products processed`);
    return results;
  }

  async exportCatalogProducts(): Promise<CatalogProduct[]> {
    return await this.getCatalogProducts();
  }
}

export const storage = new DatabaseStorage();
