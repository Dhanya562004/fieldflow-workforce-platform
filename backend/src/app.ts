import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import technicianRoutes from './routes/technician.routes';
import customerRoutes from './routes/customer.routes';
import dashboardRoutes from './routes/dashboard.routes';
import aiRoutes from './routes/ai.routes';
import healthRoutes from './routes/health.routes';
import docsRoutes from './routes/docs.routes';
import { uploadDir } from './middleware/upload.middleware';

export const createApp = () => {
  const app = express();

  // Security Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Allows Swagger UI CDN
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: '*', // Allows Streamlit, React Native Expo, and local development
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static files for photo uploads
  app.use('/uploads', express.static(path.resolve(uploadDir)));

  // Root Information Endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'FieldFlow Operations REST API',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
    });
  });

  // Health Check Endpoints (both /health and /api/health)
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/technicians', technicianRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/docs', docsRoutes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.url} does not exist.`,
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp();
