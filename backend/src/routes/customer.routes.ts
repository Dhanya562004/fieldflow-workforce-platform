import { Router } from 'express';
import { Role } from '@prisma/client';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema, queryCustomerSchema } from '../schemas/customer.schema';

const router = Router();

router.use(authenticateJwt);

router.get('/', validateQuery(queryCustomerSchema), CustomerController.listCustomers);
router.get('/:id', CustomerController.getCustomerById);
router.post(
  '/',
  requireRoles(Role.ADMIN, Role.MANAGER),
  validateBody(createCustomerSchema),
  CustomerController.createCustomer
);
router.patch(
  '/:id',
  requireRoles(Role.ADMIN, Role.MANAGER),
  validateBody(updateCustomerSchema),
  CustomerController.updateCustomer
);

export default router;
