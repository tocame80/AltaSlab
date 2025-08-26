import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoInstructions = pgTable("video_instructions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  category: text("category").notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const heroImages = pgTable("hero_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const galleryProjects = pgTable("gallery_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  application: text("application").notNull(), // interior, exterior, commercial, residential
  images: json("images").$type<string[]>().notNull().default(sql`'[]'`),
  materialsUsed: json("materials_used").$type<string[]>().notNull().default(sql`'[]'`), // Product IDs from catalog
  location: text("location"),
  area: text("area"),
  year: text("year"),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dealerLocations = pgTable("dealer_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  services: json("services").$type<string[]>().notNull().default(sql`'[]'`), // installation, delivery, consultation
  workingHours: text("working_hours"),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const catalogProducts = pgTable("catalog_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productCode: text("product_code").notNull().unique(), // Код товара (например: SS34, SS35, SS30)
  name: text("name").notNull(), // Наименование товара
  unit: text("unit").notNull().default("упак"), // Единица измерения 
  quantity: integer("quantity").default(0), // Количество
  areaPerPackage: text("area_per_package"), // м2 в упаковке
  barcode: text("barcode"), // Штрих код
  price: text("price"), // Цена
  category: text("category").notNull(), // Категория (например: АЛЬТА ИНТЕРЬЕР, Альта Слэб, Матовая Эстетика)
  collection: text("collection"), // Коллекция 
  color: text("color"), // Цвет/декор
  format: text("format"), // Формат (размеры)
  surface: text("surface"), // Поверхность
  imageUrl: text("image_url"), // Ссылка на фото
  images: json("images").$type<string[]>().notNull().default(sql`'[]'`), // Дополнительные фото
  description: text("description"), // Описание
  specifications: json("specifications").$type<Record<string, string>>().default(sql`'{}'`), // Технические характеристики
  profile: text("profile"), // Соответствие профиля
  availability: text("availability").default("В наличии"), // Наличие товара
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export type HeroImage = typeof heroImages.$inferSelect;
export type InsertHeroImage = z.infer<typeof insertHeroImageSchema>;
export type GalleryProject = typeof galleryProjects.$inferSelect;
export type InsertGalleryProject = z.infer<typeof insertGalleryProjectSchema>;
export type DealerLocation = typeof dealerLocations.$inferSelect;
export type InsertDealerLocation = z.infer<typeof insertDealerLocationSchema>;
export type CatalogProduct = typeof catalogProducts.$inferSelect;
export type InsertCatalogProduct = z.infer<typeof insertCatalogProductSchema>;
