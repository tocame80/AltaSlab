import { type User, type InsertUser, type Certificate, type InsertCertificate, type InstallationInstruction, type InsertInstallationInstruction, type VideoInstruction, type InsertVideoInstruction, type HeroImage, type InsertHeroImage, type GalleryProject, type InsertGalleryProject, type DealerLocation, type InsertDealerLocation, type CatalogProduct, type InsertCatalogProduct, users, certificates, installationInstructions, videoInstructions, heroImages, galleryProjects, dealerLocations, catalogProducts } from "@shared/schema";
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
  
  // Installation instruction methods
  getInstallationInstructions(): Promise<InstallationInstruction[]>;
  getInstallationInstruction(id: string): Promise<InstallationInstruction | undefined>;
  createInstallationInstruction(instruction: InsertInstallationInstruction): Promise<InstallationInstruction>;
  updateInstallationInstruction(id: string, instruction: Partial<InsertInstallationInstruction>): Promise<InstallationInstruction>;
  deleteInstallationInstruction(id: string): Promise<void>;
  
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
  clearAllDealerLocations(): Promise<number>;
  
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

  // Installation instruction methods
  async getInstallationInstructions(): Promise<InstallationInstruction[]> {
    return await db.select().from(installationInstructions).orderBy(asc(installationInstructions.sortOrder));
  }

  async getInstallationInstruction(id: string): Promise<InstallationInstruction | undefined> {
    const [instruction] = await db.select().from(installationInstructions).where(eq(installationInstructions.id, id));
    return instruction || undefined;
  }

  async createInstallationInstruction(insertInstruction: InsertInstallationInstruction): Promise<InstallationInstruction> {
    const [instruction] = await db
      .insert(installationInstructions)
      .values(insertInstruction)
      .returning();
    return instruction;
  }

  async updateInstallationInstruction(id: string, updates: Partial<InsertInstallationInstruction>): Promise<InstallationInstruction> {
    const [instruction] = await db
      .update(installationInstructions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(installationInstructions.id, id))
      .returning();
    return instruction;
  }

  async deleteInstallationInstruction(id: string): Promise<void> {
    await db.delete(installationInstructions).where(eq(installationInstructions.id, id));
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
      return result.filter((p: any) => p.isActive !== 0);
    } catch (error: any) {
      console.error('DatabaseStorage: Error querying galleryProjects:', error);
      console.log('DatabaseStorage: Using static fallback data for gallery projects');
      return this.getFallbackGalleryProjects();
    }
  }

  getFallbackGalleryProjects(): GalleryProject[] {
    // Return ONLY the real gallery project from actual database - no synthetic data
    return [
      {
        id: "71cecb85-a040-4e17-bbad-4453d5f06887",
        title: "Тест",
        description: "Тест Тест",
        application: "commercial",
        images: ["/assets/gallery/gallery-5.jpg", "/assets/gallery/gallery-6.jpg", "/assets/gallery/gallery-7.jpg", "/assets/gallery/gallery-8.jpg"],
        materialsUsed: ["8903", "8896", "8934"],
        location: "Тест",
        area: "85 кв.м",
        year: "2025",
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
    console.log('DatabaseStorage: Attempting to delete gallery project:', id);
    await db.delete(galleryProjects).where(eq(galleryProjects.id, id));
    console.log('DatabaseStorage: Successfully deleted gallery project:', id);
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

  async clearAllDealerLocations(): Promise<number> {
    const result = await db.delete(dealerLocations);
    return result.rowCount || 0;
  }

  // Catalog product methods
  async getCatalogProducts(): Promise<CatalogProduct[]> {
    try {
      console.log('DatabaseStorage: Attempting to query catalogProducts table...');
      // Try without isActive filter first in case column doesn't exist
      const result = await db.select().from(catalogProducts).orderBy(asc(catalogProducts.sortOrder));
      console.log('DatabaseStorage: Successfully queried catalogProducts, got', result.length, 'products');
      // Filter active products in application layer as fallback
      return result.filter((p: any) => p.isActive !== 0);
    } catch (error: any) {
      console.error('DatabaseStorage: Error querying catalogProducts:', error);
      console.log('DatabaseStorage: Using static fallback data for catalog products');
      return this.getFallbackCatalogProducts();
    }
  }

  getFallbackCatalogProducts(): CatalogProduct[] {
    // COMPLETE fallback catalog - all 69 real products from database
    // This ensures full site functionality even when production DB is unavailable
    console.log('DatabaseStorage: Loading complete fallback catalog with 69 products');
    
    return [
      {
        id: "39995108-7235-4875-822d-ca72f31af81f",
        productCode: "SPC8934",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 300х600х2,4мм 4,32м2/уп (24шт/уп) Закат",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Закат",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304122",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 1,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "bb0b5e64-3bc9-407b-9432-44865392a84b",
        productCode: "SPC8938",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 600х1200х2,4мм 5,04м2/уп (7шт/уп) Закат",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Закат",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304108",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 2,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "6cdbec9c-6ba7-40a9-961f-3c16ec3b23ff",
        productCode: "SPC8930",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 300х600х2,4мм 4,32м2/уп (24шт/уп) Метеорит",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Метеорит",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304184",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 3,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "6c631f20-3a11-46a6-9a13-3448de6ef15b",
        productCode: "SPC8931",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 600х1200х2,4мм 5,04м2/уп (7шт/уп) Метеорит",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Метеорит",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304245",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 4,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "53ace7db-2409-4b03-80aa-4746300a517a",
        productCode: "SPC8936",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 300х600х2,4мм 4,32м2/уп (24шт/уп) Комета",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Комета",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304146",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 5,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "f39878d1-3e68-4fba-9b44-788591cf6db6",
        productCode: "SPC8940",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 600х1200х2,4мм 5,04м2/уп (7шт/уп) Комета",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Комета",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304207",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 6,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "71642845-d73a-4c9b-90a6-88697bffb11c",
        productCode: "SPC8932",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 300х600х2,4мм 4,32м2/уп (24шт/уп) Полнолуние",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Полнолуние",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304160",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 7,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "22ddd059-c214-42eb-ac2d-3a55da007cc8",
        productCode: "SPC8939",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 600х1200х2,4мм 5,04м2/уп (7шт/уп) Полнолуние",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Полнолуние",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304221",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 8,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "45b4546c-a89e-483a-bb15-b36af8ae59a8",
        productCode: "SPC8935",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 300х600х2,4мм 4,32м2/уп (24шт/уп) Рассвет",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Рассвет",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304269",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 9,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "e34bd522-57b8-4bda-85f4-0040368c77ac",
        productCode: "SPC8937",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 600х1200х2,4мм 5,04м2/уп (7шт/уп) Рассвет",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Рассвет",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304283",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 10,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "1d7dce68-0128-4a96-8504-bc3ec7c4dc6c",
        productCode: "SPC8933",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 300х600х2,4мм 4,32м2/уп (24шт/уп) Азимут",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Азимут",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304085",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 11,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "03e56280-0450-44c6-806d-3a8ead18d5e5",
        productCode: "SPC8941",
        name: "Панель SPC стеновая Альта Слэб Магия Бетона 600х1200х2,4мм 5,04м2/уп (7шт/уп) Азимут",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Азимут",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304061",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 12,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "7ed3e97a-2c36-4fa7-a471-577f57f3a547",
        productCode: "SPC8883",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 300х600х2,4мм 4,32м2/уп (24шт/уп) Грейдж",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Грейдж",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304306",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 14,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "641073f5-d7af-4f3d-b7e3-afe48527523c",
        productCode: "SPC8888",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 600х1200х2,4мм 5,04м2/уп (7шт/уп) Грейдж",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Грейдж",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304320",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 15,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "58a8cf20-ff44-4c12-9d01-152d0689ce30",
        productCode: "SPC8885",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 300х600х2,4мм 4,32м2/уп (24шт/уп) Крот",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Крот",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304443",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 16,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "e1fff51b-853a-487a-b380-c7ca0d6108bb",
        productCode: "SPC8906",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 600х1200х2,4мм 5,04м2/уп (7шт/уп) Крот",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Крот",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304382",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 17,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "4073a6a6-eef7-4624-8de9-bfa7763f893c",
        productCode: "SPC8887",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 300х600х2,4мм 4,32м2/уп (24шт/уп) Тауп",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Тауп",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304429",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 18,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "c099784c-fcff-409c-ab4a-31bc56075f31",
        productCode: "SPC8890",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 600х1200х2,4мм 5,04м2/уп (7шт/уп) Тауп",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Тауп",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304368",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 19,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "524bd2f4-0b94-4277-85a9-37d36f0f620b",
        productCode: "SPC8886",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 300х600х2,4мм 4,32м2/уп (24шт/уп) Экрю",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Экрю",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304405",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 20,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "17b39ab7-a3ad-41b0-b9b8-710cc72b22b3",
        productCode: "SPC8889",
        name: "Панель SPC стеновая Альта Слэб Матовая Эстетика 600х1200х2,4мм 5,04м2/уп (7шт/уп) Экрю",
        unit: "упак",
        quantity: 0,
        collection: "matte",
        color: "Экрю",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304344",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 21,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "1dcac730-1586-4465-8c79-7b3ae73762a1",
        productCode: "SPC8919",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Везувий",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Везувий",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304641",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 23,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "85a912e3-2ac7-474d-a118-3b2459ffe3ea",
        productCode: "SPC8927",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Везувий",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Везувий",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304849",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 24,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "0c58a952-120a-493f-80ee-dffd2431a78e",
        productCode: "SPC8917",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Гекла",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Гекла",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304627",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 25,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "40ec5cf5-c3e2-453a-95c1-506d30a1a04d",
        productCode: "SPC8925",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Гекла",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Гекла",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304825",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 26,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "40126caa-c1dd-46da-8e94-26010e10d9e8",
        productCode: "SPC8913",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Кракатау",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Кракатау",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304603",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 27,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "84bcfeb1-2863-4870-a5b5-2247b1602cc2",
        productCode: "SPC8912",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Кракатау",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Кракатау",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304801",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 28,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "d9b2ade0-5c50-466a-a102-1f8b6f6d8273",
        productCode: "SPC8910",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Мисти",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Мисти",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304580",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 29,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "09703450-e3b6-44fc-81be-00d51d75f730",
        productCode: "SPC8909",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Мисти",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Мисти",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304788",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 30,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "584e9d69-aff4-40e1-8d78-e5e27cb52695",
        productCode: "SPC8911",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Орисаба",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Орисаба",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304566",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 31,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "26556114-1f51-41c1-bcc9-2cb0c74076da",
        productCode: "SPC8920",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Орисаба",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Орисаба",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304764",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 32,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "472a4833-e757-4a52-8e90-442a85a87594",
        productCode: "SPC8916",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Рейнир",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Рейнир",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304542",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 33,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "e4fcd6df-d574-416e-854b-769687e90334",
        productCode: "SPC8924",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Рейнир",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Рейнир",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304740",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 34,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "5dbfa8e3-9199-4962-8dc0-edce7e23defb",
        productCode: "SPC8914",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Сангай",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Сангай",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304528",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 35,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "91a3ad15-0e8d-4ed9-8746-c5e5f965ab3f",
        productCode: "SPC8922",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Сангай",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Сангай",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304726",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 36,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "43f1f1e8-acce-4f56-8184-c84f754db6be",
        productCode: "SPC8915",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Фудзияма",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Фудзияма",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304504",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 37,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "0a43c494-5725-4565-af37-6a11b2924899",
        productCode: "SPC8923",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Фудзияма",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Фудзияма",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304702",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 38,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "b75785b2-17c6-4e11-b322-3be1d0102a2f",
        productCode: "SPC8908",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Эльбрус",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Эльбрус",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304481",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 39,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "f0de0dab-e8bf-4924-9e68-a055c215f47a",
        productCode: "SPC8921",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Эльбрус",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Эльбрус",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304689",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 40,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "d7839760-3346-40ed-8800-b1492c1313e8",
        productCode: "SPC8918",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 300х600х2,4мм 4,32м2/уп (24шт/уп) Этна",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Этна",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304467",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 41,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "5500aa32-5f59-449d-958c-0aaef9e73c90",
        productCode: "SPC8926",
        name: "Панель SPC стеновая Альта Слэб Мраморная Феерия 600х1200х2,4мм 5,04м2/уп (7шт/уп) Этна",
        unit: "упак",
        quantity: 0,
        collection: "marble",
        color: "Этна",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218304665",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 42,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "90b81efd-b989-4cdb-b266-fd3d5acac121",
        productCode: "SPC8898",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Атлас",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Атлас",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304986",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 44,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "eb23fb85-f9c5-458a-94f9-f4785d118307",
        productCode: "SPC8905",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Атлас",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Атлас",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305167",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 45,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "eb796a52-ccff-4976-b623-8a501635a13e",
        productCode: "SPC8894",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Батист",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Батист",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304962",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 46,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "ced3d579-5e2e-4cac-a727-df1121da3bad",
        productCode: "SPC8900",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Батист",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Батист",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305143",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 47,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "b9f4df97-c9e0-4f57-bc76-78b5f3c15270",
        productCode: "SPC8891",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Вуаль",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Вуаль",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304948",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 48,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "32354775-c8aa-459a-ac81-09f291d374a4",
        productCode: "SPC8884",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Вуаль",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Вуаль",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305129",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 49,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "acc21de5-69c5-45f7-93f0-819cd5eee32f",
        productCode: "SPC8897",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Деним",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Деним",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304924",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 50,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "06622448-42dd-4315-b81c-2a561fc54ae2",
        productCode: "SPC8904",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Деним",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Деним",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305105",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 51,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "e352762a-4ca6-402b-82d2-d6016644f34b",
        productCode: "SPC8893",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Жоржет",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Жоржет",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304900",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 52,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "a0387392-f172-464c-ba1e-f5772f216f88",
        productCode: "SPC8901",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Жоржет",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Жоржет",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305082",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 53,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "584ee0c6-fc09-4cab-a7db-bcd42fe974b6",
        productCode: "SPC8892",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Лён",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Лён",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304887",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 54,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "e0664722-6003-408f-b6cf-737a52efd223",
        productCode: "SPC8899",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Лён",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Лён",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305068",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 55,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "acdd456a-49dd-48e0-9e1e-0a5f8a5eb54e",
        productCode: "SPC8895",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Сатин",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Сатин",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218304863",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 56,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "37f94173-2772-4c14-b8be-35f6b5295477",
        productCode: "SPC8902",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Сатин",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Сатин",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305044",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 57,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "b79bfe9e-2200-4fd5-9579-ae0904c29b6a",
        productCode: "SPC8896",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 300х600х2,4мм 4,32м2/уп (24шт/уп) Шифон",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Шифон",
        surface: "упак",
        format: "300х600х2,4мм",
        areaPerPackage: "4.32",
        pcsPerPackage: "24",
        price: "4739.04",
        barcode: "4650218305006",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 58,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "beafbac6-62b4-43ba-94ab-785ea33df0eb",
        productCode: "SPC8903",
        name: "Панель SPC стеновая Альта Слэб Тканевая Роскошь 600х1200х2,4мм 5,04м2/уп (7шт/уп) Шифон",
        unit: "упак",
        quantity: 0,
        collection: "concrete",
        color: "Шифон",
        surface: "упак",
        format: "600х1200х2,4мм",
        areaPerPackage: "5.04",
        pcsPerPackage: "7",
        price: "5528.88",
        barcode: "4650218305020",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 59,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "5b6578f5-4152-4922-9b3b-1ccf3baa4edb",
        productCode: "SPC8907",
        name: "Клей для потолочно-стеновых SPC панелей Альта Стик 900 гр/600 мл (12шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "Клей",
        color: "Стандарт",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "12",
        price: "1350",
        barcode: "4680136702946",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 61,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "3fab78c0-97c3-4579-b955-15744cb1b90c",
        productCode: "SPC9075",
        name: "Профиль алюминиевый под рассеивателем 081024-4 анод бронза 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Бронза",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "720",
        barcode: "4680427157004",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 62,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "8034f265-bfcb-4308-9918-a7c9c35c3be8",
        productCode: "SPC9059",
        name: "Профиль алюминиевый под рассеивателем 081024-4 анод серебро 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Серебро",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "720",
        barcode: "4680427157011",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 63,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "dc2a2d0a-41e7-4dbf-b520-ce7630ff1c9e",
        productCode: "SPC9076",
        name: "Профиль алюминиевый под рассеивателем 081024-4 анод шампань 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Шампань",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "720",
        barcode: "4680427157028",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 64,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "a1d7f2aa-1455-4c2b-a36c-fd2fd6cbe2af",
        productCode: "SPC9077",
        name: "Профиль алюминиевый соединительный 081024-2 анод бронза 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Бронза",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "420",
        barcode: "4680427157035",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 65,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2a5738b1-40c6-4741-93a6-fe288e5b85c4",
        productCode: "SPC9057",
        name: "Профиль алюминиевый соединительный 081024-2 анод серебро 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Серебро",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "420",
        barcode: "4680427157042",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 66,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "546110d7-02d9-4717-989f-cb0c4c3284e4",
        productCode: "SPC9078",
        name: "Профиль алюминиевый соединительный 081024-2 анод шампань 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Шампань",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "420",
        barcode: "4680427157059",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 67,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "b7747ad6-d1e7-4110-9055-b08d4e7e501e",
        productCode: "SPC9073",
        name: "Профиль алюминиевый торцевой 081024-1 анод бронза 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Бронза",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "440",
        barcode: "4680427157066",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 68,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "5916f809-d8a5-4ffa-aad0-bf6ad9a0b6c9",
        productCode: "SPC9056",
        name: "Профиль алюминиевый торцевой 081024-1 анод серебро 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Серебро",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "440",
        barcode: "4680427157073",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 69,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "137dcd16-f2dd-4732-b2be-92bd9950dc15",
        productCode: "SPC9074",
        name: "Профиль алюминиевый торцевой 081024-1 анод шампань 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Шампань",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "440",
        barcode: "4680427157080",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 70,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "82a546ad-d4a3-45de-87c0-d3a8f77c88a3",
        productCode: "SPC9079",
        name: "Профиль алюминиевый угловой универсальный 081024-3 анод бронза 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Бронза",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "670",
        barcode: "4680427157097",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 71,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "b3bd040d-a1ef-4436-9c99-e0e65733ec86",
        productCode: "SPC9058",
        name: "Профиль алюминиевый угловой универсальный 081024-3 анод серебро 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Серебро",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "670",
        barcode: "4680427157103",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 72,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "d606acbd-340b-4ce2-a8b9-a6ba215a8cf5",
        productCode: "SPC9080",
        name: "Профиль алюминиевый угловой универсальный 081024-3 анод шампань 2,7м (30шт/уп)",
        unit: "шт",
        quantity: 0,
        collection: "concrete",
        color: "Шампань",
        surface: "упак",
        format: "",
        areaPerPackage: "null",
        pcsPerPackage: "30",
        price: "670",
        barcode: "4680427157110",
        category: "SPC панели",
        availability: "Склад",
        sortOrder: 73,
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
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
