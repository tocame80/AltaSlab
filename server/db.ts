import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
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
  console.log('SQLite database initialized successfully');
  return db;
}

// Синхронный геттер (для совместимости с существующим кодом)
export function getDbConnection() {
  return db;
}

// Экспорт для совместимости с pool-based кодом
export const pool = {
  end: () => { sqlite.close(); }
};

console.log(`SQLite database path: ${dbPath}`);