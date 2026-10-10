import { z } from 'zod';
import { JobPriority, JobStatus } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  customerId: z.string().uuid('Invalid customer ID'),
  assignedTechnicianId: z.string().uuid('Invalid technician ID').nullable().optional(),
  serviceAddress: z.string().min(5, 'Service address must be at least 5 characters'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  priority: z.nativeEnum(JobPriority).default(JobPriority.MEDIUM),
  scheduledStart: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateJobSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  customerId: z.string().uuid().optional(),
  assignedTechnicianId: z.string().uuid().nullable().optional(),
  serviceAddress: z.string().min(5).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  priority: z.nativeEnum(JobPriority).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  scheduledStart: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateJobStatusSchema = z.object({
  status: z.nativeEnum(JobStatus),
  note: z.string().optional(),
});

export const assignJobSchema = z.object({
  technicianId: z.string().uuid('Invalid technician ID').nullable(),
});

export const createJobNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
  isInternal: z.boolean().default(false),
});

export const queryJobsSchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  priority: z.nativeEnum(JobPriority).optional(),
  technicianId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
export type AssignJobInput = z.infer<typeof assignJobSchema>;
export type CreateJobNoteInput = z.infer<typeof createJobNoteSchema>;
export type QueryJobsInput = z.infer<typeof queryJobsSchema>;
