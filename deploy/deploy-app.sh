#!/bin/bash

# 🚀 Скрипт деплоя АЛЬТА СЛЭБ каталога на TimeWeb Cloud
# Использовать после настройки сервера с помощью server-setup.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Параметры по умолчанию
APP_DIR="/var/www/alta-slab"
APP_USER="deploy"
DOMAIN=""
SSL_ENABLE=false

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

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Функция показа помощи
show_help() {
    echo "Использование: $0 [ОПЦИИ]"
    echo ""
    echo "Опции:"
    echo "  -d, --domain DOMAIN    Домен для настройки SSL"
    echo "  -s, --ssl             Включить настройку SSL"
    echo "  -h, --help            Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0                              # Деплой без SSL"
    echo "  $0 -d example.com -s           # Деплой с настройкой SSL"
    echo "  $0 --domain example.com --ssl  # То же самое"
}

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -s|--ssl)
            SSL_ENABLE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   error "Этот скрипт должен запускаться от имени root"
fi

log "🚀 Начинаем деплой АЛЬТА СЛЭБ каталога..."

# 1. Проверка существования директории
if [ ! -d "$APP_DIR" ]; then
    error "Директория $APP_DIR не существует. Сначала выполните server-setup.sh"
fi

cd $APP_DIR

# 2. Проверка наличия кода
if [ ! -f "package.json" ]; then
    error "Файл package.json не найден. Загрузите код приложения в $APP_DIR"
fi

# 3. Остановка старого процесса PM2 (если запущен)
log "🛑 Остановка предыдущих процессов..."
sudo -u $APP_USER pm2 stop alta-slab 2>/dev/null || true
sudo -u $APP_USER pm2 delete alta-slab 2>/dev/null || true

# 4. Обновление кода (если это git репозиторий)
if [ -d ".git" ]; then
    log "📥 Обновление кода из репозитория..."
    sudo -u $APP_USER git pull origin main || warn "Не удалось обновить код из git"
fi

# 5. Установка зависимостей
log "📦 Установка зависимостей..."
sudo -u $APP_USER npm ci

# 6. Создание .env файла из примера (если не существует)
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log "⚙️ Создание .env файла..."
        sudo -u $APP_USER cp .env.example .env
        warn "Отредактируйте файл .env и укажите правильные значения!"
        warn "nano $APP_DIR/.env"
    else
        warn ".env и .env.example файлы не найдены. Создайте .env вручную."
    fi
fi

# 7. Сборка проекта
log "🔨 Сборка проекта..."
sudo -u $APP_USER npm run build

# 7.1. Исправление проблем с import.meta.dirname для продакшн
log "🔧 Исправление проблем совместимости с Node.js..."
if [ -f "deploy/fix-import-meta-dirname.js" ]; then
    node deploy/fix-import-meta-dirname.js ./dist
else
    warn "Скрипт исправления не найден, пропускаем"
fi

# 7.1. Удаление dev зависимостей после сборки
log "🧹 Удаление dev зависимостей..."
sudo -u $APP_USER npm prune --omit=dev

# 8. Создание директорий для логов
log "📋 Настройка логирования..."
mkdir -p /var/log/pm2
chown -R $APP_USER:$APP_USER /var/log/pm2

# 9. Копирование ecosystem.config.js если не существует
if [ ! -f "ecosystem.config.js" ]; then
    log "📄 Создание ecosystem.config.js..."
    sudo -u $APP_USER cp deploy/ecosystem.config.js . 2>/dev/null || warn "Файл deploy/ecosystem.config.js не найден"
fi

# 10. Запуск приложения через PM2
log "🚀 Запуск приложения..."
sudo -u $APP_USER pm2 start ecosystem.config.js --env production

# 11. Сохранение конфигурации PM2
sudo -u $APP_USER pm2 save

# 12. Настройка автозапуска PM2
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp /home/$APP_USER >/dev/null 2>&1 || true

# 13. Настройка Nginx конфигурации
log "🌐 Настройка Nginx..."

# Копирование общей конфигурации
if [ -f "deploy/nginx-common.conf" ]; then
    cp deploy/nginx-common.conf /etc/nginx/conf.d/alta-slab-common.conf
    info "Скопирована общая конфигурация Nginx"
fi

# Настройка основной конфигурации
if [ -n "$DOMAIN" ]; then
    log "🌍 Настройка домена: $DOMAIN"
    
    # Замена домена в конфигурации
    if [ -f "deploy/nginx.conf" ]; then
        sed "s/your-domain.com/$DOMAIN/g" deploy/nginx.conf > /etc/nginx/sites-available/alta-slab
    else
        # Создание базовой конфигурации с доменом
        cat > /etc/nginx/sites-available/alta-slab << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    include /etc/nginx/conf.d/alta-slab-common.conf;
}
EOF
    fi
else
    # Конфигурация без домена (только IP)
    cat > /etc/nginx/sites-available/alta-slab << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    include /etc/nginx/conf.d/alta-slab-common.conf;
}
EOF
fi

# Активация сайта
ln -sf /etc/nginx/sites-available/alta-slab /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 14. Настройка SSL (если требуется)
if [ "$SSL_ENABLE" = true ] && [ -n "$DOMAIN" ]; then
    log "🔒 Настройка SSL сертификата..."
    
    # Проверка, что домен указывает на этот сервер
    DOMAIN_IP=$(dig +short $DOMAIN)
    SERVER_IP=$(curl -s ifconfig.me)
    
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        # Получение SSL сертификата
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        log "✅ SSL сертификат настроен для $DOMAIN"
    else
        warn "Домен $DOMAIN не указывает на этот сервер ($SERVER_IP). Пропускаем настройку SSL."
        warn "Настройте DNS записи и запустите: certbot --nginx -d $DOMAIN"
    fi
elif [ "$SSL_ENABLE" = true ]; then
    warn "Для настройки SSL необходимо указать домен с помощью -d"
fi

# 15. Настройка правильных прав доступа
log "🔐 Настройка прав доступа..."
chown -R $APP_USER:$APP_USER $APP_DIR
chmod -R 755 $APP_DIR

# Специальные права для папок с изображениями
find $APP_DIR/client/src/assets -type d -exec chmod 755 {} \;
find $APP_DIR/client/src/assets -type f -exec chmod 644 {} \;

# 16. Финальная проверка
log "🔍 Проверка деплоя..."

# Проверка PM2
PM2_STATUS=$(sudo -u $APP_USER pm2 describe alta-slab 2>/dev/null | grep "status" || echo "stopped")
if echo "$PM2_STATUS" | grep -q "online"; then
    log "✅ PM2: приложение запущено"
else
    error "❌ PM2: приложение не запустилось"
fi

# Проверка Nginx
if systemctl is-active --quiet nginx; then
    log "✅ Nginx: работает"
else
    error "❌ Nginx: не работает"
fi

# Проверка доступности приложения
log "🌐 Проверка доступности приложения..."
if curl -f -s http://localhost:5000/api/health >/dev/null 2>&1; then
    log "✅ Приложение отвечает на запросы"
else
    warn "⚠️ Приложение может быть не готово или есть проблемы"
fi

# 17. Информация о результате
log "🎉 Деплой завершен!"

echo ""
echo "=================== ИНФОРМАЦИЯ О ДЕПЛОЕ ==================="
echo ""

# Показать URL доступа
if [ -n "$DOMAIN" ]; then
    if [ "$SSL_ENABLE" = true ]; then
        echo "🌐 Сайт доступен по адресу: https://$DOMAIN"
        echo "🌐 Альтернативный адрес: https://www.$DOMAIN"
    else
        echo "🌐 Сайт доступен по адресу: http://$DOMAIN"
        echo "🌐 Альтернативный адрес: http://www.$DOMAIN"
    fi
else
    SERVER_IP=$(curl -s ifconfig.me)
    echo "🌐 Сайт доступен по IP: http://$SERVER_IP"
fi

echo ""
echo "📊 Полезные команды для управления:"
echo "  pm2 list                 - список процессов"
echo "  pm2 logs alta-slab       - логи приложения"
echo "  pm2 restart alta-slab    - перезапуск"
echo "  pm2 monit                - мониторинг в реальном времени"
echo ""
echo "  nginx -t                 - проверка конфигурации Nginx"
echo "  systemctl reload nginx   - перезагрузка Nginx"
echo ""
echo "  update-alta-slab         - скрипт быстрого обновления"
echo ""

if [ -n "$DOMAIN" ] && [ "$SSL_ENABLE" = false ]; then
    echo "💡 Для настройки SSL выполните:"
    echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
fi

echo "📁 Директория приложения: $APP_DIR"
echo "👤 Пользователь: $APP_USER"
echo "📋 Логи PM2: /var/log/pm2/"
echo "📋 Логи Nginx: /var/log/nginx/"
echo ""
echo "=========================================================="

# Показать последние логи для диагностики
echo ""
echo "📋 Последние логи приложения:"
sudo -u $APP_USER pm2 logs alta-slab --lines 10 --nostream 2>/dev/null || echo "Логи недоступны"

log "✅ Деплой АЛЬТА СЛЭБ каталога завершен успешно!"