import fs from 'fs';

try {
  // Читаем экспортированные данные
  const data = fs.readFileSync('fallback_catalog_data.txt', 'utf8');
  
  // Извлекаем массив товаров из экспорта
  const match = data.match(/export const FALLBACK_CATALOG = (\[[\s\S]*\]);/);
  if (!match) {
    throw new Error('Не удалось найти каталог в файле');
  }
  
  // Парсим JavaScript код
  const catalogCode = match[1];
  const products = eval(catalogCode);
  
  console.log(`Загружено ${products.length} товаров из экспорта`);
  
  // Читаем текущий storage.ts
  const storageContent = fs.readFileSync('server/storage.ts', 'utf8');
  
  // Создаем строку с полным каталогом
  const productsStr = JSON.stringify(products, null, 6).replace(/"/g, '"');
  
  // Заменяем fallback метод на полный каталог
  const newStorageContent = storageContent.replace(
    /getFallbackCatalogProducts\(\): CatalogProduct\[\] \{[\s\S]*?return \[[\s\S]*?\];[\s\S]*?\}/,
    `getFallbackCatalogProducts(): CatalogProduct[] {
    // COMPLETE fallback catalog - all ${products.length} real products from database
    // This ensures full site functionality even when production DB is unavailable
    console.log('DatabaseStorage: Loading complete fallback catalog with ${products.length} products');
    
    return ${productsStr};
  }`
  );
  
  // Записываем обновленный файл
  fs.writeFileSync('server/storage.ts', newStorageContent);
  console.log(`✓ Обновлен server/storage.ts с полным каталогом (${products.length} товаров)`);
  
} catch (error) {
  console.error('Ошибка:', error.message);
  process.exit(1);
}