#!/usr/bin/env node

/**
 * Утилита для исправления проблемы с import.meta.dirname в продакшн сборке
 * Заменяет все вхождения import.meta.dirname на совместимый код
 */

const fs = require('fs');
const path = require('path');

function fixImportMetaDirname(distPath) {
  const indexJsPath = path.join(distPath, 'index.js');
  
  if (!fs.existsSync(indexJsPath)) {
    console.log('❌ Файл dist/index.js не найден');
    return false;
  }

  console.log('🔧 Исправляем проблему с import.meta.dirname...');
  
  try {
    let content = fs.readFileSync(indexJsPath, 'utf-8');
    
    // Счетчик замен
    let replacements = 0;
    
    // Паттерны для замены import.meta.dirname
    const patterns = [
      // Прямое использование import.meta.dirname
      {
        search: /import\.meta\.dirname/g,
        replace: '(__dirname || path.dirname(new URL(import.meta.url).pathname))',
        description: 'import.meta.dirname -> совместимый __dirname'
      },
      
      // path.resolve(import.meta.dirname, ...)
      {
        search: /path\.resolve\(\s*import\.meta\.dirname\s*,([^)]+)\)/g,
        replace: 'path.resolve(__dirname || path.dirname(new URL(import.meta.url).pathname), $1)',
        description: 'path.resolve с import.meta.dirname'
      },
      
      // Вариант для случаев где dirname уже определен
      {
        search: /path\.dirname\(fileURLToPath\(import\.meta\.url\)\)/g,
        replace: '(__dirname || path.dirname(new URL(import.meta.url).pathname))',
        description: 'стандартный ES modules __dirname fallback'
      }
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.search);
      if (matches) {
        content = content.replace(pattern.search, pattern.replace);
        replacements += matches.length;
        console.log(`✅ ${pattern.description}: ${matches.length} замен`);
      }
    });
    
    // Убедимся что path модуль импортирован
    if (replacements > 0) {
      // Проверяем есть ли импорт path
      if (!content.includes('require("path")') && !content.includes('require(\'path\')') && 
          !content.includes('import path') && !content.includes('import * as path')) {
        
        // Добавляем импорт path в начало файла
        content = `const path = require('path');\n` + content;
        console.log('✅ Добавлен импорт модуля path');
      }
      
      // Сохраняем исправленный файл
      fs.writeFileSync(indexJsPath, content, 'utf-8');
      console.log(`🎉 Успешно исправлено ${replacements} проблем с import.meta.dirname`);
      
      // Создаем резервную копию
      const backupPath = indexJsPath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, fs.readFileSync(indexJsPath, 'utf-8'), 'utf-8');
        console.log('💾 Создана резервная копия: index.js.backup');
      }
      
    } else {
      console.log('ℹ️  Проблемы с import.meta.dirname не найдены');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка при исправлении файла:', error.message);
    return false;
  }
}

// Запуск из командной строки
if (require.main === module) {
  const distPath = process.argv[2] || './dist';
  
  console.log('🚀 Исправление проблем с import.meta.dirname для продакшн');
  console.log(`📁 Директория: ${path.resolve(distPath)}`);
  
  if (fixImportMetaDirname(distPath)) {
    console.log('✅ Исправление завершено успешно');
    process.exit(0);
  } else {
    console.log('❌ Исправление не удалось');
    process.exit(1);
  }
}

module.exports = { fixImportMetaDirname };