import { z } from 'zod';
import { JobPriority } from '@prisma/client';

export const summarizeJobSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
});

export const suggestPrioritySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().default(''),
  customerTier: z.enum(['STANDARD', 'PREMIUM', 'ENTERPRISE_MISSION_CRITICAL']).default('STANDARD'),
  dueDate: z.string().datetime().optional().nullable(),
});

export const aiSummaryResponseSchema = z.object({
  jobId: z.string(),
  summary: z.string(),
  keyFindings: z.array(z.string()),
  recommendedNextStep: z.string(),
  provider: z.enum(['gemini', 'deterministic-fallback']),
});

export const aiPriorityResponseSchema = z.object({
  suggestedPriority: z.nativeEnum(JobPriority),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  riskFactors: z.array(z.string()),
  provider: z.enum(['gemini', 'deterministic-fallback']),
});

export type SummarizeJobInput = z.infer<typeof summarizeJobSchema>;
export type SuggestPriorityInput = z.infer<typeof suggestPrioritySchema>;
export type AiSummaryResponse = z.infer<typeof aiSummaryResponseSchema>;
export type AiPriorityResponse = z.infer<typeof aiPriorityResponseSchema>;
