import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@shared/schema';
import path from 'path';
import fs from 'fs';

// Создаем папку data если не существует
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Путь к файлу базы данных
const dbPath = path.join(dataDir, 'database.db');

// Создаем подключение к SQLite
const sqlite = new Database(dbPath);

// Включаем WAL mode для лучшей производительности
sqlite.pragma('journal_mode = WAL');

// Включаем foreign keys
sqlite.pragma('foreign_keys = ON');

// Создаем и экспортируем экземпляр Drizzle
export const db = drizzle(sqlite, { schema });

// Функция для инициализации (для совместимости с существующим кодом)
export async function initializeConnection() {
  try {
    // Применяем миграции SQLite при запуске
    const migrationsFolder = path.join(process.cwd(), 'migrations-sqlite');
    if (fs.existsSync(migrationsFolder)) {
      console.log('Applying SQLite migrations...');
      migrate(db, { migrationsFolder });
      console.log('SQLite migrations applied successfully');
    } else {
      console.log('No migrations folder found, skipping migrations');
    }
    
    console.log('SQLite database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw error;
  }
}

// Функция init для совместимости
const init = async () => {
  console.log('SQLite database ready');
  return db;
};

// Добавляем метод init к экземпляру db для совместимости
(db as any).init = init;

// Синхронный геттер (для совместимости с существующим кодом)
export function getDbConnection() {
  return db;
}

// Экспорт для совместимости с pool-based кодом
export const pool = {
  end: () => { sqlite.close(); }
};

console.log(`SQLite database path: ${dbPath}`);