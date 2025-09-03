import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create database connection lazily to avoid startup crashes
let dbInstance: any = null;
let poolInstance: Pool | null = null;

export function getDbConnection() {
  if (!dbInstance) {
    try {
      console.log('Initializing database connection...');
      poolInstance = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
        max: 5  
      });
      dbInstance = drizzle({ client: poolInstance, schema });
      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      throw error;
    }
  }
  return dbInstance;
}

// Export db getter that handles connection failures gracefully
export const db = new Proxy({} as any, {
  get(target, prop) {
    try {
      const connection = getDbConnection();
      return connection[prop];
    } catch (error) {
      console.error('Database connection error:', error);
      // Return a mock that will cause methods to throw, allowing fallback systems to work
      throw error;
    }
  }
});

export const pool = new Proxy({} as any, {
  get(target, prop: string | symbol) {
    try {
      if (!poolInstance) {
        getDbConnection(); // This will initialize the pool
      }
      return (poolInstance as any)?.[prop];
    } catch (error) {
      console.error('Database pool error:', error);
      throw error;
    }
  }
});
