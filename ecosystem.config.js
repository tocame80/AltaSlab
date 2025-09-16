module.exports = {
  apps: [
    {
      name: 'alta-slab',
      script: 'server/index.ts',
      interpreter: 'tsx',
      instances: 'max', // Используем все CPU ядра
      exec_mode: 'cluster', // Кластерный режим для лучшей производительности
      
      // Переменные окружения
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // Настройки автозапуска
      autorestart: true,
      watch: false, // В production не нужно следить за изменениями
      max_memory_restart: '1G', // Перезапуск при превышении памяти
      
      // Логирование
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: '/var/log/pm2/alta-slab-out.log',
      error_file: '/var/log/pm2/alta-slab-error.log',
      merge_logs: true,
      
      // Настройки перезапуска
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,
      
      // Мониторинг
      pmx: true,
      
      // Настройки кластера
      listen_timeout: 8000,
      kill_timeout: 5000,
      
      // Игнорируемые сигналы
      ignore_watch: [
        'node_modules',
        '.git',
        'logs',
        '*.log'
      ]
    }
  ],

  // Конфигурация деплоя
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/alta-slab-catalog.git',
      path: '/var/www/alta-slab',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && npm run build && npm prune --omit=dev && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};