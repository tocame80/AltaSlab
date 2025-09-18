import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  issueDate: text("issue_date").notNull(),
  validUntil: text("valid_until").notNull(),
  issuer: text("issuer").notNull(),
  size: text("size").notNull(),
  number: text("number").notNull(),
  imageUrl: text("image_url"),
  fileUrl: text("file_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export const videoInstructions = sqliteTable("video_instructions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  category: text("category").notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export const installationInstructions = sqliteTable("installation_instructions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // installation-guide, layout-schemes, care-recommendations, warranty-conditions
  size: text("size").notNull(),
  fileUrl: text("file_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export const heroImages = sqliteTable("hero_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export const galleryProjects = sqliteTable("gallery_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  application: text("application").notNull(), // interior, exterior, commercial, residential
  images: text("images", { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  materialsUsed: text("materials_used", { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`), // Product IDs from catalog
  location: text("location"),
  area: text("area"),
  year: text("year"),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export const dealerLocations = sqliteTable("dealer_locations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  dealerType: text("dealer_type").notNull(), // retail, wholesale, authorized
  services: text("services", { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`), // installation, delivery, consultation
  workingHours: text("working_hours"),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export const catalogProducts = sqliteTable("catalog_products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productCode: text("product_code").notNull().unique(), // Код товара (например: SS34, SS35, SS30)
  name: text("name").notNull(), // Наименование товара
  unit: text("unit").notNull().default("упак"), // Единица измерения 
  quantity: integer("quantity").default(0), // Количество
  pcsPerPackage: real("pcs_per_package"), // Шт в уп
  areaPerPackage: real("area_per_package"), // м2 в уп
  barcode: text("barcode"), // Штрих код
  price: text("price"), // Цена
  category: text("category").notNull(), // Категория (например: АЛЬТА ИНТЕРЬЕР, Альта Слэб, Матовая Эстетика)
  collection: text("collection"), // Коллекция 
  color: text("color"), // Цвет/декор
  format: text("format"), // Формат (размеры)
  surface: text("surface"), // Поверхность
  imageUrl: text("image_url"), // Ссылка на фото
  images: text("images", { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`), // Дополнительные фото
  description: text("description"), // Описание
  specifications: text("specifications", { mode: 'json' }).$type<Record<string, string>>().default(sql`'{}'`), // Технические характеристики
  profile: text("profile"), // Соответствие профиля
  availability: text("availability").default("В наличии"), // Наличие товара
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").default(sql`(current_timestamp)`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoInstructionSchema = createInsertSchema(videoInstructions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstallationInstructionSchema = createInsertSchema(installationInstructions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHeroImageSchema = createInsertSchema(heroImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryProjectSchema = createInsertSchema(galleryProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDealerLocationSchema = createInsertSchema(dealerLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCatalogProductSchema = createInsertSchema(catalogProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type VideoInstruction = typeof videoInstructions.$inferSelect;
export type InsertVideoInstruction = z.infer<typeof insertVideoInstructionSchema>;
export type InstallationInstruction = typeof installationInstructions.$inferSelect;
export type InsertInstallationInstruction = z.infer<typeof insertInstallationInstructionSchema>;
export type HeroImage = typeof heroImages.$inferSelect;
export type InsertHeroImage = z.infer<typeof insertHeroImageSchema>;
export type GalleryProject = typeof galleryProjects.$inferSelect;
export type InsertGalleryProject = z.infer<typeof insertGalleryProjectSchema>;
export type DealerLocation = typeof dealerLocations.$inferSelect;
export type InsertDealerLocation = z.infer<typeof insertDealerLocationSchema>;
export type CatalogProduct = typeof catalogProducts.$inferSelect;
export type InsertCatalogProduct = z.infer<typeof insertCatalogProductSchema>;
