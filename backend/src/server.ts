import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { healthRoutes } from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import { studentRoutes } from './routes/student.routes';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth.middleware';
import { requireRole } from './middleware/role.middleware';

const app = express();

// Core Middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

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
