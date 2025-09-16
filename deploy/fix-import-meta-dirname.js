#!/usr/bin/env node

/**
 * Утилита для исправления проблемы с import.meta.dirname в продакшн сборке
 * Заменяет все вхождения import.meta.dirname на совместимый код
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules эквивалент __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    // Расширенные паттерны для замены import.meta.dirname
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
      },
      
      // Дополнительные паттерны для скомпилированного кода
      {
        search: /path\.resolve\(\s*void\s+0\s*,([^)]+)\)/g,
        replace: 'path.resolve(__dirname || path.dirname(new URL(import.meta.url).pathname), $1)',
        description: 'path.resolve(void 0, ...) -> исправление undefined'
      },
      
      // Паттерны для undefined в первом аргументе path.resolve
      {
        search: /path\.resolve\(\s*undefined\s*,([^)]+)\)/g,
        replace: 'path.resolve(__dirname || path.dirname(new URL(import.meta.url).pathname), $1)',
        description: 'path.resolve(undefined, ...) -> исправление undefined'
      },
      
      // Если переменная была undefined
      {
        search: /path\.resolve\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,([^)]+)\)/g,
        replace: (match, varName, rest) => {
          if (varName === '__dirname') return match; // Не заменяем если уже __dirname
          return `path.resolve((${varName} || __dirname || path.dirname(new URL(import.meta.url).pathname)), ${rest})`;
        },
        description: 'path.resolve(variable, ...) -> добавление fallback'
      },
      
      // Защита для случаев когда path не определен
      {
        search: /(\w+)\.resolve\(/g,
        replace: (match, pathVar) => {
          if (pathVar === 'path') return match;
          return `(${pathVar} || path).resolve(`;
        },
        description: 'защита от undefined path объекта'
      }
    ];
    
    patterns.forEach(pattern => {
      const searchPattern = pattern.search;
      const replaceValue = pattern.replace;
      
      if (typeof replaceValue === 'function') {
        // Для функций замены
        const matches = [...content.matchAll(searchPattern)];
        if (matches.length > 0) {
          content = content.replace(searchPattern, replaceValue);
          replacements += matches.length;
          console.log(`✅ ${pattern.description}: ${matches.length} замен`);
        }
      } else {
        // Для строковых замен
        const matches = content.match(searchPattern);
        if (matches) {
          content = content.replace(searchPattern, replaceValue);
          replacements += matches.length;
          console.log(`✅ ${pattern.description}: ${matches.length} замен`);
        }
      }
    });
    
    // Убедимся что path модуль импортирован и URL доступен
    if (replacements > 0) {
      let needsPathImport = false;
      let needsUrlImport = false;
      
      // Проверяем есть ли импорт path (CommonJS или ES)
      if (!content.includes('require("path")') && !content.includes('require(\'path\')') && 
          !content.includes('import path') && !content.includes('import * as path')) {
        needsPathImport = true;
      }
      
      // Проверяем есть ли импорт URL (если используется в замене)
      if (content.includes('new URL(import.meta.url)') && 
          !content.includes('require("url")') && !content.includes('require(\'url\')') &&
          !content.includes('import { URL }') && !content.includes('import * as url') &&
          !content.includes('import url')) {
        needsUrlImport = true;
      }
      
      // Удаляем старые неправильные CommonJS импорты если они в начале файла
      if (content.startsWith('const { URL } = require(\'url\');\n')) {
        content = content.replace(/^const { URL } = require\('url'\);\n/, '');
        console.log('🧹 Удален старый CommonJS импорт URL');
      }
      if (content.startsWith('const path = require(\'path\');\n')) {
        content = content.replace(/^const path = require\('path'\);\n/, '');
        console.log('🧹 Удален старый CommonJS импорт path');
      }
      
      // Добавляем необходимые импорты в ES стиле
      let imports = '';
      if (needsPathImport) {
        imports += 'import path from \'path\';\n';
        console.log('✅ Добавлен ES импорт модуля path');
      }
      if (needsUrlImport) {
        imports += 'import { URL } from \'url\';\n';
        console.log('✅ Добавлен ES импорт модуля URL');
      }
      
      if (imports) {
        content = imports + content;
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

// Запуск из командной строки (ES modules)
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url === new URL(process.argv[1], 'file://').href;

if (isMainModule) {
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

export { fixImportMetaDirname };