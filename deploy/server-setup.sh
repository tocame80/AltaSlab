#!/bin/bash

# 🚀 Автоматическая настройка сервера TimeWeb для АЛЬТА СЛЭБ каталога
# Этот скрипт настраивает Ubuntu 22.04/24.04 для размещения Node.js приложения

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция логирования
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

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   error "Этот скрипт должен запускаться от имени root (sudo bash server-setup.sh)"
fi

log "🚀 Начинаем настройку сервера для АЛЬТА СЛЭБ каталога..."

# 1. Обновление системы
log "📦 Обновление системы..."
apt update && apt upgrade -y

# 2. Установка базовых пакетов
log "🔧 Установка необходимых пакетов..."
apt install -y curl git nginx ufw htop unzip wget

# 3. Настройка UFW (Firewall)
log "🛡️ Настройка firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 4. Установка Node.js
log "📦 Установка Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверка версии Node.js
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "✅ Node.js установлен: $NODE_VERSION"
log "✅ NPM установлен: $NPM_VERSION"

# 5. Установка PM2
log "🔄 Установка PM2..."
npm install -g pm2

# 6. Создание пользователя для приложения (если не существует)
if ! id "deploy" &>/dev/null; then
    log "👤 Создание пользователя deploy..."
    useradd -m -s /bin/bash deploy
    usermod -aG sudo deploy
else
    info "Пользователь deploy уже существует"
fi

# 7. Создание директории для приложения
log "📁 Создание директории для приложения..."
mkdir -p /var/www/alta-slab
chown -R deploy:deploy /var/www/alta-slab

# 8. Настройка Nginx (базовая конфигурация)
log "🌐 Настройка Nginx..."

# Удаление стандартной конфигурации
rm -f /etc/nginx/sites-enabled/default

# Создание конфигурации для приложения
cat > /etc/nginx/sites-available/alta-slab << 'EOF'
server {
    listen 80;
    server_name _;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Static files handling
    location /assets {
        alias /var/www/alta-slab/client/src/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # API и основное приложение
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Логи
    access_log /var/log/nginx/alta-slab.access.log;
    error_log /var/log/nginx/alta-slab.error.log;
}
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/alta-slab /etc/nginx/sites-enabled/

# Проверка конфигурации Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

# 9. Установка Let's Encrypt (Certbot)
log "🔒 Установка Certbot для SSL..."
apt install -y certbot python3-certbot-nginx

# 10. Настройка логротации для PM2
log "📋 Настройка логротации..."
cat > /etc/logrotate.d/pm2 << 'EOF'
/home/deploy/.pm2/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 deploy deploy
    postrotate
        sudo -u deploy pm2 reloadLogs
    endscript
}
EOF

# 11. Настройка swap файла (если меньше 2GB RAM)
TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
if [ $TOTAL_MEM -lt 2048 ]; then
    log "💾 Настройка swap файла (RAM: ${TOTAL_MEM}MB)..."
    
    if [ ! -f /swapfile ]; then
        fallocate -l 1G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        log "✅ Swap файл создан: 1GB"
    else
        info "Swap файл уже существует"
    fi
fi

# 12. Настройка автозапуска PM2
log "🔄 Настройка автозапуска PM2..."
sudo -u deploy bash -c "
    export HOME=/home/deploy
    cd /home/deploy
    pm2 startup systemd -u deploy --hp /home/deploy
" 2>/dev/null || true

# 13. Создание скрипта обновления приложения
log "📜 Создание скрипта обновления..."
cat > /usr/local/bin/update-alta-slab << 'EOF'
#!/bin/bash
set -e

USER="deploy"
APP_DIR="/var/www/alta-slab"

echo "🔄 Обновление АЛЬТА СЛЭБ каталога..."

# Переход в директорию приложения
cd $APP_DIR

# Остановка приложения
sudo -u $USER pm2 stop alta-slab || true

# Обновление кода
sudo -u $USER git pull origin main

# Установка зависимостей
sudo -u $USER npm ci --production

# Сборка приложения
sudo -u $USER npm run build

# Запуск приложения
sudo -u $USER pm2 start ecosystem.config.js

echo "✅ Обновление завершено!"
EOF

chmod +x /usr/local/bin/update-alta-slab

# 14. Создание базового .env файла
log "⚙️ Создание базового .env файла..."
cat > /var/www/alta-slab/.env.example << 'EOF'
# Производственная среда
NODE_ENV=production

# Порт приложения
PORT=5000

# База данных PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/alta_slab

# API ключи
YANDEX_MAPS_API_KEY=your_yandex_maps_api_key_here

# Безопасность
SESSION_SECRET=your_very_long_random_session_secret_here

# Домен (для production)
DOMAIN=your-domain.com
EOF

chown deploy:deploy /var/www/alta-slab/.env.example

# 15. Финальная проверка
log "🔍 Финальная проверка установки..."

echo ""
echo "=== ПРОВЕРКА УСТАНОВЛЕННЫХ КОМПОНЕНТОВ ==="
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "Certbot: $(certbot --version)"
echo ""

# Проверка статуса сервисов
systemctl is-active --quiet nginx && echo "✅ Nginx: работает" || echo "❌ Nginx: не работает"
systemctl is-active --quiet ufw && echo "✅ UFW: активен" || echo "❌ UFW: не активен"

log "🎉 Настройка сервера завершена успешно!"

echo ""
echo "=================== СЛЕДУЮЩИЕ ШАГИ ==================="
echo ""
echo "1. 📂 Загрузите код приложения в /var/www/alta-slab/"
echo "   cd /var/www/alta-slab"
echo "   git clone https://github.com/your-username/alta-slab-catalog.git ."
echo ""
echo "2. ⚙️ Настройте переменные окружения:"
echo "   cp .env.example .env"
echo "   nano .env"
echo ""
echo "3. 📦 Установите зависимости и соберите проект:"
echo "   npm install"
echo "   npm run build"
echo ""
echo "4. 🚀 Запустите приложение через PM2:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "5. 🔒 Настройте SSL сертификат (если есть домен):"
echo "   certbot --nginx -d your-domain.com"
echo ""
echo "📊 Полезные команды:"
echo "   pm2 list         - список процессов"
echo "   pm2 logs         - просмотр логов"
echo "   pm2 monit        - мониторинг"
echo "   update-alta-slab - обновление приложения"
echo ""
echo "🌐 Приложение будет доступно по адресу: http://your-server-ip"
echo ""
echo "======================================================"