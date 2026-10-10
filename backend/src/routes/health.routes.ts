import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();
const startTime = Date.now();

router.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'fieldflow-operations-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptimeSeconds: Math.round((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
