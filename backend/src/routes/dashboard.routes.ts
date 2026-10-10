import { Router } from 'express';
import { Role } from '@prisma/client';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticateJwt);
router.use(requireRoles(Role.ADMIN, Role.MANAGER));

router.get('/summary', DashboardController.getSummary);
router.get('/job-trends', DashboardController.getJobTrends);
router.get('/workload', DashboardController.getWorkload);

export default router;
