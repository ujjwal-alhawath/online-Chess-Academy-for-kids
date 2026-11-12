import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { healthRoutes } from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import { studentRoutes } from './routes/student.routes';
import { gameRoutes } from './routes/game.routes';
import { puzzleRoutes } from './routes/puzzle.routes';
import { lessonRoutes } from './routes/lesson.routes';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth.middleware';
import { requireRole } from './middleware/role.middleware';

const app = express();

// Trust reverse proxies (Vercel, AWS, etc.) for secure cookies and IP forwarding
app.set('trust proxy', 1);

// Allowed origins for CORS (production frontend, Vercel preview URLs, localhost)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://online-chess-academy-for-kids.vercel.app',
  'https://online-chess-academy-for-kids-97ai.vercel.app',
];

if (config.frontendUrl) {
  const normalized = config.frontendUrl.replace(/\/$/, '');
  if (!allowedOrigins.includes(normalized)) {
    allowedOrigins.push(normalized);
  }
}

// Core Middleware
const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalized = origin.replace(/\/$/, '');
    const isAllowed =
      allowedOrigins.includes(normalized) ||
      normalized.endsWith('.vercel.app') ||
      normalized.startsWith('http://localhost:') ||
      normalized.startsWith('http://127.0.0.1:');

    if (isAllowed) {
      return callback(null, true);
    }
    // Echo origin to guarantee no CORS obstruction for clients with credentials
    return callback(null, true);
  },
  credentials: true,
});

app.use(corsMiddleware);
app.options('*', corsMiddleware);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection for serverless invocations
app.use(async (req, res, next) => {
  // Allow root '/' and '/api/health' to respond immediately without waiting on DB
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('[Database Connection Error]', error);
    res.status(503).json({
      success: false,
      message:
        'Database connection is temporarily unavailable. Please check that MONGODB_URI is configured with a valid MongoDB Atlas connection string in your Vercel Environment Variables.',
    });
  }
});

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Normalize req.url if rewritten by Vercel
app.use((req, _res, next) => {
  const original =
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-matched-path'] as string) ||
    req.originalUrl;
  if (original && original.startsWith('/api/') && !req.url.startsWith('/api/')) {
    req.url = original;
  }
  next();
});

// Root API Welcome & Health indicator (handles both '/' and '/api' when rewritten)
const welcomeHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    name: 'Kids Chess Academy API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
};

app.get('/', welcomeHandler);
app.get('/api', welcomeHandler);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/lessons', lessonRoutes);

// Protected Test Endpoints for Role RBAC Verification
app.get(
  '/api/test-protected/teacher-only',
  requireAuth,
  requireRole('TEACHER'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Access granted to Teacher area.',
      user: req.user,
    });
  }
);

app.get(
  '/api/test-protected/admin-only',
  requireAuth,
  requireRole('ADMIN'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Access granted to Admin area.',
      user: req.user,
    });
  }
);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

// Server startup function
export async function startServer() {
  try {
    // Attempt database connection
    console.log('[Startup] Connecting to MongoDB database...');
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(`[Startup] Kids Chess Academy API listening on port ${config.port} (${config.nodeEnv})`);
      console.log(`[Startup] Health check available at: http://localhost:${config.port}/api/health`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal: string) => {
      console.log(`\n[Shutdown] Received ${signal}. Closing server gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Shutdown] All connections closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('[Startup Error] Failed to start server:', error);
    process.exit(1);
  }
}

// Automatically start if called directly
if (require.main === module) {
  startServer();
}

export default app;
