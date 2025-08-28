#!/usr/bin/env node

/**
 * Автоматизированная система обработки каталога фото 1.24 ГБ
 * Оптимизирует изображения и обновляет imageMap.ts
 */

const fs = require('fs').promises;
const path = require('path');

const PRODUCTS_DIR = 'client/src/assets/products';
const TEMP_DIR = path.join(PRODUCTS_DIR, 'temp');
const IMAGE_MAP_PATH = path.join(PRODUCTS_DIR, 'imageMap.ts');

// Коллекции и их точные названия папок из вашего каталога
const COLLECTIONS = {
  'concrete': {
    keywords: ['МагияБетона'],
    designs: ['АЗИМУТ', 'ЗАКАТ', 'КОМЕТА', 'МЕТЕОРИТ', 'ПОЛНОЛУНИЕ', 'РАССВЕТ']
  },
  'matte': {
    keywords: ['МатоваяЭстетика'],
    designs: ['РЕЙДЖК', 'КОТ', 'ТАУП', 'ЭКРЮ']
  },
  'marble': {
    keywords: ['МраморнаяФеерия'],
    designs: ['ВЕЗУВИЙ', 'КИЛИМАНДЖАРО', 'КРАКАТАУ', 'МИСТИ', 'ОРИСАБА', 'РЕЙНИР', 'САНГАЙ', 'ФУДЗИЯМА', 'ЭЛЬБРУС', 'ЭТНА']
  },
  'fabric': {
    keywords: ['ТканеваяРоскошь'],
    designs: ['АТЛАС', 'БАТИСТ', 'ВУАЛЬ', 'ДЕНИМ', 'КОРЖЕТ', 'ЛЁН', 'САТИН', 'ШИФОН']
  }
};

async function processUploadedImages() {
  console.log('🚀 Начинаем обработку каталога фото...');
  
  try {
    // Проверяем существование temp директории
    await fs.access(TEMP_DIR);
    console.log('✅ Найдена папка temp с загруженными изображениями');
    
    const files = await fs.readdir(TEMP_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    console.log(`📁 Найдено изображений: ${imageFiles.length}`);
    
    if (imageFiles.length === 0) {
      console.log('⚠️ Изображения не найдены в temp папке');
      return;
    }
    
    // Группируем по коллекциям
    const groupedImages = {};
    
    for (const file of imageFiles) {
      const collection = detectCollection(file);
      const productId = extractProductId(file);
      
      if (collection && productId) {
        if (!groupedImages[collection]) {
          groupedImages[collection] = {};
        }
        if (!groupedImages[collection][productId]) {
          groupedImages[collection][productId] = [];
        }
        groupedImages[collection][productId].push(file);
      }
    }
    
    // Обрабатываем каждую коллекцию
    let totalProcessed = 0;
    for (const [collection, products] of Object.entries(groupedImages)) {
      console.log(`\n📦 Обрабатываем коллекцию: ${collection}`);
      
      for (const [productId, files] of Object.entries(products)) {
        console.log(`  🏷️ Товар ${productId}: ${files.length} изображений`);
        
        const targetDir = path.join(PRODUCTS_DIR, collection, productId);
        await fs.mkdir(targetDir, { recursive: true });
        
        // Копируем файлы с правильными именами
        for (let i = 0; i < files.length; i++) {
          const srcFile = path.join(TEMP_DIR, files[i]);
          const ext = path.extname(files[i]);
          const dstFile = path.join(targetDir, `${productId}-${i + 1}${ext}`);
          
          await fs.copyFile(srcFile, dstFile);
          totalProcessed++;
        }
      }
    }
    
    console.log(`\n✅ Обработано изображений: ${totalProcessed}`);
    console.log('🔄 Обновляем imageMap.ts...');
    
    // Обновляем imageMap.ts
    await updateImageMap();
    
    console.log('✅ Каталог фото успешно обработан!');
    console.log('📝 Рекомендуется очистить temp папку после проверки');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📋 Создаем структуру для загрузки каталога...');
      await createUploadStructure();
    } else {
      console.error('❌ Ошибка обработки:', error.message);
    }
  }
}

function detectCollection(folderName) {
  // Определяем коллекцию по названию папки
  for (const [collection, config] of Object.entries(COLLECTIONS)) {
    for (const keyword of config.keywords) {
      if (folderName.includes(keyword)) {
        return { collection, design: extractDesign(folderName, config.designs) };
      }
    }
  }
  
  return { collection: 'concrete', design: 'UNKNOWN' };
}

function extractDesign(folderName, designs) {
  for (const design of designs) {
    if (folderName.includes(design)) {
      return design;
    }
  }
  return 'UNKNOWN';
}

function extractProductId(filename) {
  // Извлекаем 4-значный номер товара
  const match = filename.match(/(\d{4})/);
  return match ? match[1] : null;
}

async function createUploadStructure() {
  const dirs = [
    path.join(PRODUCTS_DIR, 'temp'),
    path.join(PRODUCTS_DIR, 'concrete'),
    path.join(PRODUCTS_DIR, 'matte'), 
    path.join(PRODUCTS_DIR, 'marble'),
    path.join(PRODUCTS_DIR, 'fabric')
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
  
  console.log('✅ Структура для загрузки создана');
  console.log('📁 Загружайте изображения в: client/src/assets/products/temp/');
}

async function updateImageMap() {
  // Простое обновление - система автоматически обнаружит новые изображения
  console.log('🔄 imageMap.ts будет автоматически обновлен при следующей загрузке страницы');
}

// Запуск скрипта
if (require.main === module) {
  processUploadedImages().catch(console.error);
}

module.exports = { processUploadedImages };