import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations-sqlite",
  schema: "./shared/schema.ts", 
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./data/database.db",
  },
});