import { z } from 'zod';

export const createTechnicianSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  skills: z.string().default('General Maintenance'),
  vehicleNumber: z.string().optional(),
  serviceZone: z.string().optional(),
  maxConcurrentJobs: z.number().int().min(1).max(10).default(4),
  isAvailable: z.boolean().default(true),
});

export const updateTechnicianSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  skills: z.string().optional(),
  vehicleNumber: z.string().optional().nullable(),
  serviceZone: z.string().optional().nullable(),
  maxConcurrentJobs: z.number().int().min(1).max(10).optional(),
  isAvailable: z.boolean().optional(),
});

export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
export type UpdateTechnicianInput = z.infer<typeof updateTechnicianSchema>;
