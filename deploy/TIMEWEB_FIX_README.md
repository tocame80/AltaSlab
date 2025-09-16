# 🔧 Исправление ошибки import.meta.dirname на TimeWeb

## Проблема
На сервере TimeWeb возникает ошибка:
```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
at path.resolve (node:path:1115:7)
```

Это происходит из-за того, что `import.meta.dirname` становится `undefined` в продакшн сборке.

## ✅ Решение

### 1. Автоматическое исправление (рекомендуется)
Скрипты деплоя уже обновлены и автоматически применяют исправления:

```bash
# При деплое автоматически применяется исправление
bash deploy/deploy-app.sh -d your-domain.com
```

### 2. Ручное исправление (если нужно)
Если нужно применить исправление отдельно:

```bash
# На сервере TimeWeb выполните:
cd /var/www/alta-slab
node deploy/fix-import-meta-dirname.js ./dist
```

### 3. При обновлениях
Скрипт обновления также включает исправление:

```bash
# На сервере TimeWeb:
update-alta-slab
```

## 🔍 Что делает исправление

Скрипт `fix-import-meta-dirname.js`:

1. **Находит проблемные места** в `dist/index.js`
2. **Заменяет** `import.meta.dirname` на совместимый код:
   ```javascript
   // Было:
   import.meta.dirname
   
   // Стало:
   (__dirname || path.dirname(new URL(import.meta.url).pathname))
   ```
3. **Добавляет импорт path** если его нет
4. **Создает резервную копию** оригинального файла

## 📊 Проверка работы

После применения исправления проверьте:

```bash
# Проверка запуска приложения
pm2 logs alta-slab

# Проверка API
curl http://localhost:5000/api/health

# Проверка статуса
pm2 list
```

## 🚨 В случае проблем

Если что-то пошло не так, восстановите из резервной копии:

```bash
cd /var/www/alta-slab
cp dist/index.js.backup dist/index.js
pm2 restart alta-slab
```

## ℹ️ Техническая информация

**Причина ошибки:**
- `import.meta.dirname` - экспериментальная функция Node.js 20.11.0+
- Webpack и другие сборщики не поддерживают её полностью
- В продакшн сборке может становиться `undefined`

**Решение:**
- Используем совместимый fallback для всех версий Node.js
- Поддерживает как старые, так и новые версии
- Автоматически применяется при каждой сборке