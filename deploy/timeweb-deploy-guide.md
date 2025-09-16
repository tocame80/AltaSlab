# 🚀 Инструкция по деплою АЛЬТА СЛЭБ каталога на TimeWeb Cloud

## 📋 Требования

### Что вам нужно:
- **VPS сервер** на TimeWeb Cloud (минимум 1GB RAM)
- **Ubuntu 22.04/24.04** (рекомендуется)
- **SSH доступ** к серверу
- **Доменное имя** (опционально)

## 🔧 Подготовка сервера

### 1. Подключение к серверу
```bash
ssh root@your-server-ip
```

### 2. Обновление системы
```bash
apt update && apt upgrade -y
```

### 3. Установка необходимых пакетов
```bash
apt install -y curl git nginx ufw
```

## 📦 Установка Node.js

### Установка через NodeSource (рекомендуется)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
```

### Проверка установки
```bash
node --version  # должно показать v20.x.x
npm --version   # должно показать 10.x.x
```

## 🔄 Установка PM2 (Process Manager)
```bash
npm install -g pm2
```

## 🛡️ Настройка Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## 📁 Деплой приложения

### 1. Создание директории
```bash
mkdir -p /var/www/alta-slab
cd /var/www/alta-slab
```

### 2. Загрузка кода (вы уже загрузили через SSH)
Если код еще не загружен:
```bash
git clone https://github.com/your-username/alta-slab-catalog.git .
```

### 3. Установка зависимостей
```bash
npm install
```

### 4. Настройка переменных окружения
```bash
cp .env.example .env
nano .env
```

Настройте переменные:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgresql_connection_string
YANDEX_MAPS_API_KEY=your_yandex_maps_key
```

### 5. Сборка проекта
```bash
npm run build
```

## ⚙️ Настройка PM2

### 1. Создание ecosystem файла
```bash
nano ecosystem.config.js
```

### 2. Запуск приложения
```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## 🌐 Настройка Nginx

### 1. Создание конфигурации
```bash
nano /etc/nginx/sites-available/alta-slab
```

### 2. Активация сайта
```bash
ln -s /etc/nginx/sites-available/alta-slab /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔒 Настройка SSL (Let's Encrypt)

### 1. Установка Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 2. Получение сертификата
```bash
certbot --nginx -d your-domain.com
```

## 📊 Мониторинг и управление

### PM2 команды
```bash
pm2 list          # список процессов
pm2 logs          # просмотр логов
pm2 restart all   # перезапуск
pm2 stop all      # остановка
pm2 delete all    # удаление
```

### Мониторинг ресурсов
```bash
pm2 monit         # мониторинг в реальном времени
htop              # системные ресурсы
df -h             # место на диске
```

## 🔄 Обновление приложения

```bash
cd /var/www/alta-slab
git pull origin main
npm install
npm run build
pm2 restart all
```

## 🚨 Устранение неполадок

### Проверка логов
```bash
pm2 logs                    # логи приложения
tail -f /var/log/nginx/error.log  # логи Nginx
journalctl -u nginx         # системные логи Nginx
```

### Распространенные проблемы
1. **Порт занят**: `lsof -i :5000`
2. **Права доступа**: `chown -R www-data:www-data /var/www/alta-slab`
3. **Память**: `free -h` и рестарт приложения

## 📞 Поддержка TimeWeb

- **Панель управления**: личный кабинет TimeWeb Cloud
- **Техподдержка**: 24/7 в личном кабинете
- **Документация**: https://timeweb.cloud/tutorials/

---

## ✅ Чек-лист готовности

- [ ] Сервер настроен и обновлен
- [ ] Node.js и PM2 установлены
- [ ] Приложение загружено и зависимости установлены
- [ ] PM2 настроен и запущен
- [ ] Nginx настроен как reverse proxy
- [ ] SSL сертификат установлен (если нужен)
- [ ] Firewall настроен
- [ ] Домен привязан к серверу

После выполнения всех шагов ваш каталог АЛЬТА СЛЭБ будет доступен по адресу вашего домена или IP адресу сервера!