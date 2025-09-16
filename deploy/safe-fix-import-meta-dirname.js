#!/usr/bin/env node

/**
 * БЕЗОПАСНОЕ исправление проблемы с import.meta.dirname в продакшн сборке
 * Только точечные замены, без широких регулярных выражений
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules эквивалент __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function safeFixImportMetaDirname(distPath) {
  const indexJsPath = path.join(distPath, 'index.js');
  
  if (!fs.existsSync(indexJsPath)) {
    console.log('❌ Файл dist/index.js не найден');
    return false;
  }

  console.log('🔧 Безопасное исправление import.meta.dirname...');
  
  try {
    let content = fs.readFileSync(indexJsPath, 'utf-8');
    let replacements = 0;
    
    // Создаем резервную копию
    const backupPath = indexJsPath + '.backup';
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content, 'utf-8');
      console.log('💾 Создана резервная копия: index.js.backup');
    }
    
    // ТОЛЬКО безопасные точечные замены
    const safePatterns = [
      {
        search: /import\.meta\.dirname/g,
        replace: '(__dirname || path.dirname(new URL(import.meta.url).pathname))',
        description: 'Прямое использование import.meta.dirname'
      }
    ];
    
    safePatterns.forEach(pattern => {
      const matches = content.match(pattern.search);
      if (matches) {
        content = content.replace(pattern.search, pattern.replace);
        replacements += matches.length;
        console.log(`✅ ${pattern.description}: ${matches.length} замен`);
      }
    });
    
    // Добавляем импорты только если были замены
    if (replacements > 0) {
      // Проверяем нужен ли импорт path
      if (!content.includes('import path from') && !content.includes('const path = require')) {
        content = 'import path from \'path\';\n' + content;
        console.log('✅ Добавлен импорт path');
      }
      
      // Проверяем нужен ли импорт URL (только если используется)
      if (content.includes('new URL(import.meta.url)') && 
          !content.includes('import { URL }') && !content.includes('const { URL }')) {
        content = 'import { URL } from \'url\';\n' + content;
        console.log('✅ Добавлен импорт URL');
      }
      
      // Сохраняем исправленный файл
      fs.writeFileSync(indexJsPath, content, 'utf-8');
      console.log(`🎉 Успешно исправлено ${replacements} проблем`);
      
    } else {
      console.log('ℹ️  Проблемы с import.meta.dirname не найдены');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при исправлении файла:', error.message);
    return false;
  }
}

// Запуск из командной строки (ES modules)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const distPath = process.argv[2] || './dist';
  
  console.log('🚀 БЕЗОПАСНОЕ исправление import.meta.dirname для продакшн');
  console.log(`📁 Директория: ${path.resolve(distPath)}`);
  
  if (safeFixImportMetaDirname(distPath)) {
    console.log('✅ Исправление завершено успешно');
    process.exit(0);
  } else {
    console.log('❌ Исправление не удалось');
    process.exit(1);
  }
}

export { safeFixImportMetaDirname };