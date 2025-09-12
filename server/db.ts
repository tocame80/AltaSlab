import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon with optimized settings
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;
neonConfig.pipelineTLS = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Connection management variables
let dbInstance: any = null;
let poolInstance: Pool | null = null;
let isConnecting = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to wait for a specified amount of time
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced connection initialization with retry logic
export async function initializeConnection(): Promise<any> {
  if (dbInstance && !isConnecting) {
    return dbInstance;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await delay(100);
    }
    return dbInstance;
  }

  isConnecting = true;
  
  try {
    console.log(`Initializing database connection (attempt ${connectionRetries + 1}/${MAX_RETRIES})...`);
    
    // Close existing pool if it exists and is unhealthy
    if (poolInstance) {
      try {
        await poolInstance.end();
        console.log('Closed previous database pool');
      } catch (error) {
        console.log('Error closing previous pool:', error);
      }
      poolInstance = null;
    }

    // Create new pool with optimized settings for Neon
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,     // Reduced timeout for faster failure detection
      idleTimeoutMillis: 10000,          // Shorter idle timeout to prevent stale connections
      max: 1,                            // Single connection for Neon serverless
      maxUses: 7500,                     // Limit connection reuse to prevent issues
      allowExitOnIdle: true,             // Allow pool to close when idle
      ssl: { rejectUnauthorized: false }
    });

    // Set up pool error handlers
    poolInstance.on('error', (err: any) => {
      console.error('Database pool error:', err);
      if (err.code === '57P01' || err.severity === 'FATAL') {
        console.log('Fatal database error detected, will reinitialize on next request');
        dbInstance = null;
        poolInstance = null;
        connectionRetries = 0;
      }
    });

    poolInstance.on('connect', () => {
      console.log('Database pool connected successfully');
      connectionRetries = 0; // Reset retry counter on successful connection
    });

    poolInstance.on('remove', () => {
      console.log('Database connection removed from pool');
    });

    // Test the connection with a simple query
    const testClient = await poolInstance.connect();
    await testClient.query('SELECT 1');
    testClient.release();

    dbInstance = drizzle({ client: poolInstance, schema });
    console.log('Database connection initialized successfully');
    
    connectionRetries = 0;
    return dbInstance;
    
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    connectionRetries++;
    
    if (connectionRetries < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      isConnecting = false;
      return initializeConnection();
    } else {
      console.error(`Max connection retries (${MAX_RETRIES}) exceeded`);
      connectionRetries = 0;
      throw error;
    }
  } finally {
    isConnecting = false;
  }
}

// Synchronous getter that returns existing connection or throws
export function getDbConnection() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeConnection() first.');
  }
  return dbInstance;
}

// Enhanced db proxy with better error handling and method chaining support
export const db = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'init') {
      return initializeConnection;
    }
    
    try {
      if (!dbInstance) {
        // Try to initialize synchronously first
        if (poolInstance) {
          dbInstance = drizzle({ client: poolInstance, schema });
        } else {
          throw new Error('Database connection not available. Initialize connection first.');
        }
      }
      
      const connection = dbInstance;
      const originalProperty = connection[prop];
      
      // Handle function properties (methods)
      if (typeof originalProperty === 'function') {
        return function (...args: any[]) {
          try {
            const result = originalProperty.apply(connection, args);
            
            // If the result is a promise, handle async errors
            if (result && typeof result.then === 'function') {
              return result.catch(async (error: any) => {
                // Handle connection errors by attempting reconnection
                if (error.code === '57P01' || error.severity === 'FATAL' || 
                    error.message?.includes('connection') || error.message?.includes('closed')) {
                  console.log('Database connection error detected, attempting reconnection...');
                  dbInstance = null;
                  
                  try {
                    await initializeConnection();
                    if (dbInstance) {
                      return dbInstance[prop].apply(dbInstance, args);
                    }
                  } catch (reconnectError) {
                    console.error('Failed to reconnect to database:', reconnectError);
                    throw error; // Throw original error to trigger fallback
                  }
                }
                throw error;
              });
            }
            
            return result;
          } catch (error: any) {
            console.error('Database operation error:', error);
            throw error;
          }
        };
      }
      
      // For non-function properties, return as-is
      return originalProperty;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
});

// Enhanced pool proxy with better error handling  
export const pool = new Proxy({} as any, {
  get(target, prop: string | symbol) {
    try {
      if (!poolInstance) {
        throw new Error('Database pool not available. Initialize connection first.');
      }
      return (poolInstance as any)?.[prop];
    } catch (error) {
      console.error('Database pool error:', error);
      throw error;
    }
  }
});
