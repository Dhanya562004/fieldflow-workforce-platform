import { Router } from 'express';
import { Role } from '@prisma/client';
import { JobController } from '../controllers/job.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  assignJobSchema,
  createJobNoteSchema,
  queryJobsSchema,
} from '../schemas/job.schema';
import { uploadAttachmentMiddleware } from '../middleware/upload.middleware';

const router = Router();

// All job operations require authentication
router.use(authenticateJwt);

// List jobs (filtered by query, technicians only receive their assigned work)
router.get('/', validateQuery(queryJobsSchema), JobController.listJobs);

// Create job (Managers and Admins)
router.post(
  '/',
  requireRoles(Role.ADMIN, Role.MANAGER),
  validateBody(createJobSchema),
  JobController.createJob
);

// Get single job details (Technicians restricted to their assigned job)
router.get('/:id', JobController.getJobById);

// Update job details (Managers and Admins)
router.patch(
  '/:id',
  requireRoles(Role.ADMIN, Role.MANAGER),
  validateBody(updateJobSchema),
  JobController.updateJob
);

// Update status (Admin, Manager, or assigned Technician)
router.patch(
  '/:id/status',
  validateBody(updateJobStatusSchema),
  JobController.updateJobStatus
);

// Assign technician to job (Admin, Manager)
router.post(
  '/:id/assign',
  requireRoles(Role.ADMIN, Role.MANAGER),
  validateBody(assignJobSchema),
  JobController.assignJob
);

// Add note to job
router.post(
  '/:id/notes',
  validateBody(createJobNoteSchema),
  JobController.addNote
);

// Upload photo/document attachment
router.post(
  '/:id/attachments',
  uploadAttachmentMiddleware.single('file'),
  JobController.uploadAttachment
);

export default router;
