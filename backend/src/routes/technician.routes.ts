import { Router } from 'express';
import { Role } from '@prisma/client';
import { TechnicianController } from '../controllers/technician.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createTechnicianSchema, updateTechnicianSchema } from '../schemas/technician.schema';

const router = Router();

router.use(authenticateJwt);

router.get('/', requireRoles(Role.ADMIN, Role.MANAGER), TechnicianController.listTechnicians);
router.post(
  '/',
  requireRoles(Role.ADMIN, Role.MANAGER),
  validateBody(createTechnicianSchema),
  TechnicianController.createTechnician
);
router.get('/:id', TechnicianController.getTechnicianById);
router.patch(
  '/:id',
  requireRoles(Role.ADMIN, Role.MANAGER, Role.TECHNICIAN),
  validateBody(updateTechnicianSchema),
  TechnicianController.updateTechnician
);

export default router;
