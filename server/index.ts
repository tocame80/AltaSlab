import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

// Environment variables validation
function validateEnvironment() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Validate environment on startup
validateEnvironment();

// Initialize database connection early
import { db } from "./db";
async function initDatabase() {
  try {
    console.log('Initializing database connection at startup...');
    await (db as any).init();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.log('Server will continue with fallback data if database queries fail');
  }
}

const app = express();

// Trust proxy for rate limiting (necessary when behind reverse proxy/CDN)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

// Disable Helmet CSP completely and set our own
app.use(helmet({
  contentSecurityPolicy: false, // Disable helmet CSP 
  referrerPolicy: {
    policy: 'origin-when-cross-origin'
  },
  crossOriginEmbedderPolicy: false // Для совместимости с Replit
}));

// Custom CSP middleware for Yandex Maps v3
app.use((req, res, next) => {
  const csp = [
    "default-src 'self' blob: data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://yastatic.net https://*.yastatic.net",
    "font-src 'self' data: https://fonts.gstatic.com https://yastatic.net https://*.yastatic.net",
    "img-src 'self' data: blob: https: https://*.yandex.ru https://*.yandex.net https://*.maps.yandex.net https://yastatic.net https://*.yastatic.net",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://replit.com https://api-maps.yandex.ru https://*.yandex.ru https://*.yandex.net https://*.maps.yandex.ru https://*.maps.yandex.net https://yastatic.net https://*.yastatic.net https://rutube.ru https://*.rutube.ru https://www.youtube.com https://*.youtube.com https://youtube-nocookie.com https://*.youtube-nocookie.com https://vk.com https://*.vk.com",
    "script-src-elem 'self' 'unsafe-inline' https://api-maps.yandex.ru https://*.yandex.ru https://*.yandex.net https://*.maps.yandex.ru https://*.maps.yandex.net https://yastatic.net https://*.yastatic.net https://replit.com",
    "connect-src 'self' ws: wss: https: data: https://api-maps.yandex.ru https://*.yandex.ru https://*.yandex.net https://*.maps.yandex.net https://yastatic.net https://*.yastatic.net https://geocode-maps.yandex.ru https://sp.replit.com https://analytics.google.com https://stats.g.doubleclick.net https://logs.browser-intake-us5-datadoghq.com",
    "frame-src 'self' https://*.yandex.ru https://*.yandex.net https://rutube.ru https://*.rutube.ru https://www.youtube.com https://youtube.com https://*.youtube.com https://youtube-nocookie.com https://*.youtube-nocookie.com https://vk.com https://*.vk.com",
    "object-src 'none'",
    "worker-src 'self' blob: https://*.yandex.ru https://*.yandex.net https://yastatic.net https://*.yastatic.net https://api-maps.yandex.ru",
    "child-src 'self' blob:"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://altaslab.ru', 'https://www.altaslab.ru'] // Замените на ваш домен
    : true, // В development разрешаем все origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression for better performance
app.use(compression());

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за 15 минут
  message: {
    error: 'Слишком много запросов с вашего IP. Попробуйте позже.',
    retryAfter: '15 минут'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Health check endpoint - MUST be before other routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve gallery images statically
app.use('/assets/gallery', express.static(path.join(process.cwd(), 'client', 'src', 'assets', 'gallery')));

(async () => {
  // Initialize database connection before starting server
  await initDatabase();
  
  const server = await registerRoutes(app);

  // Error handler for API routes
  app.use('/api/*', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Custom middleware to handle API routes before Vite catches them
  app.use('*', (req, res, next) => {
    // If this is an API route, skip static file serving
    if (req.originalUrl.startsWith('/api/')) {
      const error: any = new Error(`API endpoint not found: ${req.originalUrl}`);
      error.status = 404;
      return res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method
      });
    }
    next();
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global error handler for non-API routes  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
