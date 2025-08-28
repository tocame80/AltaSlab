const fs = require('fs');

// Читаем экспортированные данные
const data = fs.readFileSync('fallback_catalog_data.txt', 'utf8');

// Парсим TypeScript код
const products = eval(data);

console.log(`Загружено ${products.length} товаров из экспорта`);

// Создаем TypeScript файл с полным каталогом
const tsContent = `// Полный fallback каталог - все ${products.length} товаров из реальной базы данных
// Экспортировано из базы данных 28.08.2025 для обеспечения работы сайта без подключения к БД

import { CatalogProduct } from '../shared/schema';

export const FALLBACK_CATALOG: CatalogProduct[] = ${JSON.stringify(products, null, 2)};

// Export count for reference
export const FALLBACK_CATALOG_COUNT = ${products.length};`;

fs.writeFileSync('server/fallback-catalog-full.ts', tsContent);
console.log(`Создан файл server/fallback-catalog-full.ts с ${products.length} товарами`);
