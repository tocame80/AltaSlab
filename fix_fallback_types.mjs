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
  
  // Исправляем типы данных для каждого продукта
  const fixedProducts = products.map(product => ({
    ...product,
    createdAt: 'new Date()',
    updatedAt: 'new Date()',
    // Убираем .0 из числовых полей
    pcsPerPackage: product.pcsPerPackage?.toString().replace('.0', '') || product.pcsPerPackage,
    barcode: product.barcode?.toString().replace('.0', '') || product.barcode
  }));
  
  // Создаем TypeScript код с правильными типами
  let tsCode = `getFallbackCatalogProducts(): CatalogProduct[] {
    // COMPLETE fallback catalog - all ${fixedProducts.length} real products from database
    // This ensures full site functionality even when production DB is unavailable
    console.log('DatabaseStorage: Loading complete fallback catalog with ${fixedProducts.length} products');
    
    return [`;
  
  fixedProducts.forEach((product, index) => {
    tsCode += `
      {
        id: "${product.id}",
        productCode: "${product.productCode}",
        name: "${product.name.replace(/"/g, '\\"')}",
        unit: "${product.unit}",
        quantity: ${product.quantity},
        collection: "${product.collection}",
        color: "${product.color}",
        surface: "${product.surface}",
        format: "${product.format}",
        areaPerPackage: "${product.areaPerPackage}",
        pcsPerPackage: "${product.pcsPerPackage}",
        price: "${product.price}",
        barcode: "${product.barcode}",
        category: "${product.category}",
        availability: "${product.availability}",
        sortOrder: ${product.sortOrder},
        imageUrl: null,
        images: [],
        description: null,
        specifications: {},
        profile: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }${index < fixedProducts.length - 1 ? ',' : ''}`;
  });
  
  tsCode += `
    ];
  }`;
  
  // Читаем текущий storage.ts и заменяем метод
  const storageContent = fs.readFileSync('server/storage.ts', 'utf8');
  
  const newStorageContent = storageContent.replace(
    /getFallbackCatalogProducts\(\): CatalogProduct\[\] \{[\s\S]*?\n  \}/,
    tsCode
  );
  
  fs.writeFileSync('server/storage.ts', newStorageContent);
  console.log(`✓ Исправлен server/storage.ts с правильными типами (${fixedProducts.length} товаров)`);
  
} catch (error) {
  console.error('Ошибка:', error.message);
  process.exit(1);
}