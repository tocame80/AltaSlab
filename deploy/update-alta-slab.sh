#!/bin/bash

# 🔄 Скрипт быстрого обновления АЛЬТА СЛЭБ каталога
# Использовать для обновления приложения без полного реплоя

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Параметры
APP_DIR="/var/www/alta-slab"
APP_USER="deploy"

# Функции логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   error "Этот скрипт должен запускаться от имени root"
fi

# Проверка существования директории
if [ ! -d "$APP_DIR" ]; then
    error "Директория $APP_DIR не существует"
fi

cd $APP_DIR

log "🔄 Быстрое обновление АЛЬТА СЛЭБ каталога..."

# 1. Остановка приложения
log "🛑 Остановка приложения..."
sudo -u $APP_USER pm2 stop alta-slab || warn "Приложение уже остановлено"

# 2. Обновление кода (если это git репозиторий)
if [ -d ".git" ]; then
    log "📥 Обновление кода из репозитория..."
    sudo -u $APP_USER git pull origin main || warn "Не удалось обновить код из git"
fi

# 3. Установка зависимостей (только если package.json изменился)
if [ "package.json" -nt "node_modules/.package.json.stamp" ]; then
    log "📦 Обновление зависимостей..."
    sudo -u $APP_USER npm ci
    touch node_modules/.package.json.stamp
else
    log "📦 Зависимости актуальны"
fi

# 4. Сборка проекта
log "🔨 Пересборка проекта..."
sudo -u $APP_USER npm run build

# 5. Исправление проблем совместимости
log "🔧 Исправление проблем совместимости с Node.js..."
if [ -f "deploy/fix-import-meta-dirname.js" ]; then
    node deploy/fix-import-meta-dirname.js ./dist
else
    warn "Скрипт исправления не найден, пропускаем"
fi

# 6. Очистка dev зависимостей
log "🧹 Удаление dev зависимостей..."
sudo -u $APP_USER npm prune --omit=dev

# 7. Запуск приложения
log "🚀 Запуск приложения..."
sudo -u $APP_USER pm2 start alta-slab || sudo -u $APP_USER pm2 restart alta-slab

# 8. Проверка статуса
log "🔍 Проверка состояния приложения..."
sleep 3

PM2_STATUS=$(sudo -u $APP_USER pm2 describe alta-slab 2>/dev/null | grep "status" || echo "stopped")
if echo "$PM2_STATUS" | grep -q "online"; then
    log "✅ Приложение успешно обновлено и запущено"
else
    error "❌ Не удалось запустить приложение"
fi

# 9. Перезагрузка Nginx (на всякий случай)
log "🌐 Перезагрузка Nginx..."
nginx -t && systemctl reload nginx

log "🎉 Обновление завершено успешно!"

echo ""
echo "📊 Полезные команды для мониторинга:"
echo "  pm2 logs alta-slab       - логи приложения"
echo "  pm2 monit                - мониторинг в реальном времени"
echo "  curl http://localhost:5000/api/health  - проверка здоровья API"