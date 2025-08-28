#!/usr/bin/env node

/**
 * Обработка структурированного каталога фото
 * Работает с вашей папочной структурой: МагияБетонаАЗИМУТ, МатоваяЭстетикаКОТ и т.д.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_DIR = 'client/src/assets/products';
const SOURCE_DIR = path.join(PRODUCTS_DIR, 'catalog_source'); // Папка для вашего каталога

// Маппинг коллекций по названиям папок из вашего каталога
const COLLECTION_MAPPING = {
  // Магия Бетона
  'МагияБетонаАЗИМУТ': { collection: 'concrete', design: 'АЗИМУТ' },
  'МагияБетонаЗАКАТ': { collection: 'concrete', design: 'ЗАКАТ' },
  'МагияБетонаКОМЕТА': { collection: 'concrete', design: 'КОМЕТА' },
  'МагияБетонаМЕТЕОРИТ': { collection: 'concrete', design: 'МЕТЕОРИТ' },
  'МагияБетонаПОЛНОЛУНИЕ': { collection: 'concrete', design: 'ПОЛНОЛУНИЕ' },
  'МагияБетонаРАССВЕТ': { collection: 'concrete', design: 'РАССВЕТ' },
  
  // Матовая Эстетика
  'МатоваяЭстетикаРЕЙДЖК': { collection: 'matte', design: 'РЕЙДЖК' },
  'МатоваяЭстетикаКОТ': { collection: 'matte', design: 'КОТ' },
  'МатоваяЭстетикаТАУП': { collection: 'matte', design: 'ТАУП' },
  'МатоваяЭстетикаЭКРЮ': { collection: 'matte', design: 'ЭКРЮ' },
  
  // Мраморная Феерия
  'МраморнаяФеерияВЕЗУВИЙ': { collection: 'marble', design: 'ВЕЗУВИЙ' },
  'МраморнаяФеерияКИЛИМАНДЖАРО': { collection: 'marble', design: 'КИЛИМАНДЖАРО' },
  'МраморнаяФеерияКРАКАТАУ': { collection: 'marble', design: 'КРАКАТАУ' },
  'МраморнаяФеерияМИСТИ': { collection: 'marble', design: 'МИСТИ' },
  'МраморнаяФеерияОРИСАБА': { collection: 'marble', design: 'ОРИСАБА' },
  'МраморнаяФеерияРЕЙНИР': { collection: 'marble', design: 'РЕЙНИР' },
  'МраморнаяФеерияСАНГАЙ': { collection: 'marble', design: 'САНГАЙ' },
  'МраморнаяФеерияФУДЗИЯМА': { collection: 'marble', design: 'ФУДЗИЯМА' },
  'МраморнаяФеерияЭЛЬБРУС': { collection: 'marble', design: 'ЭЛЬБРУС' },
  'МраморнаяФеерияЭТНА': { collection: 'marble', design: 'ЭТНА' },
  
  // Тканевая Роскошь
  'ТканеваяРоскошьАТЛАС': { collection: 'fabric', design: 'АТЛАС' },
  'ТканеваяРоскошьБАТИСТ': { collection: 'fabric', design: 'БАТИСТ' },
  'ТканеваяРоскошьВУАЛЬ': { collection: 'fabric', design: 'ВУАЛЬ' },
  'ТканеваяРоскошьДЕНИМ': { collection: 'fabric', design: 'ДЕНИМ' },
  'ТканеваяРоскошьКОРЖЕТ': { collection: 'fabric', design: 'КОРЖЕТ' },
  'ТканеваяРоскошьЛЁН': { collection: 'fabric', design: 'ЛЁН' },
  'ТканеваяРоскошьСАТИН': { collection: 'fabric', design: 'САТИН' },
  'ТканеваяРоскошьШИФОН': { collection: 'fabric', design: 'ШИФОН' }
};

async function processStructuredCatalog() {
  console.log('🚀 Обработка структурированного каталога...');
  
  try {
    // Проверяем исходную папку
    await fs.access(SOURCE_DIR);
    const folders = await fs.readdir(SOURCE_DIR);
    
    console.log(`📁 Найдено папок: ${folders.length}`);
    
    let processedImages = 0;
    let processedFolders = 0;
    
    for (const folderName of folders) {
      const folderPath = path.join(SOURCE_DIR, folderName);
      const stats = await fs.stat(folderPath);
      
      if (!stats.isDirectory()) continue;
      
      // Определяем коллекцию и дизайн
      const mapping = COLLECTION_MAPPING[folderName];
      if (!mapping) {
        console.log(`⚠️ Неизвестная папка: ${folderName}`);
        continue;
      }
      
      console.log(`📦 Обрабатываем: ${folderName} -> ${mapping.collection}/${mapping.design}`);
      
      // Создаем целевую папку
      const targetPath = path.join(PRODUCTS_DIR, mapping.collection, mapping.design);
      await fs.mkdir(targetPath, { recursive: true });
      
      // Обрабатываем изображения в папке
      const files = await fs.readdir(folderPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );
      
      console.log(`  📸 Изображений: ${imageFiles.length}`);
      
      for (let i = 0; i < imageFiles.length; i++) {
        const sourceFile = path.join(folderPath, imageFiles[i]);
        const ext = path.extname(imageFiles[i]);
        
        // Извлекаем код товара из названия файла
        const productCode = extractProductCode(imageFiles[i]);
        const newFileName = productCode ? 
          `${productCode}-${i + 1}${ext}` : 
          `${mapping.design.toLowerCase()}-${i + 1}${ext}`;
        
        const targetFile = path.join(targetPath, newFileName);
        
        await fs.copyFile(sourceFile, targetFile);
        processedImages++;
      }
      
      processedFolders++;
    }
    
    console.log(`\n✅ Обработано:`);
    console.log(`   📁 Папок: ${processedFolders}`);
    console.log(`   📸 Изображений: ${processedImages}`);
    
    // Обновляем imageMap.ts
    console.log('🔄 Обновляем imageMap.ts...');
    await updateImageMapStructure();
    
    console.log('✅ Каталог успешно обработан!');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📋 Создаем папку для каталога...');
      await fs.mkdir(SOURCE_DIR, { recursive: true });
      console.log(`✅ Создана папка: ${SOURCE_DIR}`);
      console.log('📁 Загружайте ваш структурированный каталог в эту папку');
    } else {
      console.error('❌ Ошибка:', error.message);
    }
  }
}

function extractProductCode(filename) {
  // Ищем 4-значный код товара в названии файла
  const match = filename.match(/(\d{4})/);
  return match ? match[1] : null;
}

async function updateImageMapStructure() {
  // Система автоматически обнаружит новые изображения при следующей загрузке
  console.log('🔄 imageMap.ts будет автоматически обновлен');
  
  // Можно добавить принудительное обновление imageMap.ts здесь
  // если нужно немедленное обновление
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  processStructuredCatalog().catch(console.error);
}

export { processStructuredCatalog };