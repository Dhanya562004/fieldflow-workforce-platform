import { JobPriority } from '@prisma/client';
import prisma from '../prisma';
import {
  AiSummaryResponse,
  AiPriorityResponse,
  aiSummaryResponseSchema,
  aiPriorityResponseSchema,
} from '../schemas/ai.schema';
import { AppError } from '../middleware/errorHandler.middleware';

export class AiService {
  private static apiKey = process.env.GEMINI_API_KEY || '';
  private static model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  static isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  /**
   * Generates an operational synthesis of a job based on its description,
   * customer details, and field notes. Falls back to deterministic rule engine.
   */
  static async summarizeJob(jobId: string): Promise<AiSummaryResponse> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: true,
        assignedTechnician: { select: { name: true } },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { name: true, role: true } } },
        },
      },
    });

    if (!job) {
      throw new AppError('Job not found for AI summarization', 404, 'NOT_FOUND');
    }

    if (this.isConfigured()) {
      try {
        const geminiResult = await this.callGeminiForSummary(job);
        if (geminiResult) {
          return aiSummaryResponseSchema.parse(geminiResult);
        }
      } catch (err) {
        console.warn('[AI Service] Gemini API call failed or timed out. Falling back to deterministic engine.', err);
      }
    }

    // Deterministic Rule-Based Fallback
    return this.fallbackSummarize(job);
  }

  /**
   * Evaluates job details, SLA due date, and customer tier to recommend priority.
   */
  static async suggestPriority(input: {
    title: string;
    description?: string;
    customerTier?: string;
    dueDate?: string | null;
  }): Promise<AiPriorityResponse> {
    if (this.isConfigured()) {
      try {
        const geminiResult = await this.callGeminiForPriority(input);
        if (geminiResult) {
          return aiPriorityResponseSchema.parse(geminiResult);
        }
      } catch (err) {
        console.warn('[AI Service] Gemini priority suggestion failed. Using deterministic fallback.', err);
      }
    }

    // Deterministic Rule-Based Fallback
    return this.fallbackSuggestPriority(input);
  }

  static getHealth() {
    return {
      status: 'healthy',
      provider: this.isConfigured() ? 'gemini' : 'deterministic-fallback',
      model: this.model,
      geminiConfigured: this.isConfigured(),
      fallbackEngineActive: true,
    };
  }

  // --- Gemini API Adapters ---

  private static async callGeminiForSummary(job: any): Promise<AiSummaryResponse | null> {
    const prompt = `You are an operations assistant for FieldFlow field workforce management.
Analyze this work order and field notes:
Job Number: ${job.jobNumber}
Title: ${job.title}
Customer: ${job.customer.name} (${job.customer.company || 'N/A'})
Address: ${job.serviceAddress}
Status: ${job.status}
Priority: ${job.priority}
Description: ${job.description || 'None'}
Field Notes:
${job.notes.map((n: any) => `- [${n.author.name} (${n.author.role})]: ${n.content}`).join('\n')}

Output strict JSON with this exact schema:
{
  "jobId": "${job.id}",
  "summary": "2-3 sentence executive operational overview",
  "keyFindings": ["finding 1", "finding 2"],
  "recommendedNextStep": "Specific immediate action for the dispatcher or technician",
  "provider": "gemini"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    parsed.jobId = job.id;
    parsed.provider = 'gemini';
    return parsed;
  }

  private static async callGeminiForPriority(input: {
    title: string;
    description?: string;
    customerTier?: string;
    dueDate?: string | null;
  }): Promise<AiPriorityResponse | null> {
    const prompt = `You are a triage AI for field operations dispatching.
Evaluate this job request:
Title: ${input.title}
Description: ${input.description || ''}
Customer Tier: ${input.customerTier || 'STANDARD'}
Due Date: ${input.dueDate || 'Unspecified'}

Determine the appropriate priority level: LOW, MEDIUM, HIGH, or CRITICAL.
Output strict JSON with this exact schema:
{
  "suggestedPriority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "confidence": 0.85,
  "reasoning": "Clear explanation based on operational risk, safety, or SLA",
  "riskFactors": ["Risk 1", "Risk 2"],
  "provider": "gemini"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    parsed.provider = 'gemini';
    return parsed;
  }

  // --- Deterministic Rule-Based Fallback Engine ---

  private static fallbackSummarize(job: any): AiSummaryResponse {
    const notesCount = job.notes.length;
    const latestNote = notesCount > 0 ? job.notes[0].content : 'No field notes submitted yet.';
    const isCompleted = job.status === 'COMPLETED';
    const isCritical = job.priority === 'CRITICAL';

    const findings: string[] = [];
    if (job.description) {
      findings.push(`Scope: ${job.description.slice(0, 120)}...`);
    }
    if (notesCount > 0) {
      findings.push(`Latest update from field: "${latestNote.slice(0, 100)}"`);
    } else {
      findings.push('Awaiting initial on-site technician dispatch notes.');
    }
    if (job.assignedTechnician) {
      findings.push(`Assigned specialist: ${job.assignedTechnician.name}`);
    } else {
      findings.push('Work order is currently unassigned in dispatch backlog.');
    }

    let summary = '';
    let nextStep = '';

    if (isCompleted) {
      summary = `Work order ${job.jobNumber} for ${job.customer.name} has been completed and verified. Primary scope addressed at ${job.serviceAddress}.`;
      nextStep = 'Archive work order and trigger customer sign-off notification.';
    } else if (isCritical) {
      summary = `Critical operational escalation for ${job.customer.name}. Work order ${job.jobNumber} requires urgent attention due to potential service disruption.`;
      nextStep = job.assignedTechnician
        ? `Monitor ${job.assignedTechnician.name}'s progress on site; verify SLA compliance.`
        : 'Immediate dispatch required: assign highest-qualification available technician.';
    } else {
      summary = `Routine work order ${job.jobNumber} for ${job.customer.name} (${job.priority} priority). Scheduled at ${job.serviceAddress}.`;
      nextStep = job.assignedTechnician
        ? 'Maintain standard dispatch tracking and review completion notes.'
        : 'Assign technician based on geographic zone availability.';
    }

    return {
      jobId: job.id,
      summary,
      keyFindings: findings,
      recommendedNextStep: nextStep,
      provider: 'deterministic-fallback',
    };
  }

  private static fallbackSuggestPriority(input: {
    title: string;
    description?: string;
    customerTier?: string;
    dueDate?: string | null;
  }): AiPriorityResponse {
    const text = `${input.title} ${input.description || ''}`.toLowerCase();
    const risks: string[] = [];

    // Critical trigger phrases
    const criticalKeywords = [
      'outage',
      'down',
      'emergency',
      'leak',
      'flood',
      'explosion',
      'smoke',
      'fire',
      'icu',
      'hospital',
      'data center',
      'chiller trip',
      'biohazard',
      'danger',
    ];
    // High trigger phrases
    const highKeywords = ['trip', 'alarm', 'pressure loss', 'freeze', 'vfd fault', 'overheat', 'jammed', 'seized'];

    let priority: JobPriority = JobPriority.MEDIUM;
    let confidence = 0.8;
    let reason = 'Standard operational request with no immediate safety or SLA triggers detected.';

    const matchedCritical = criticalKeywords.filter((w) => text.includes(w));
    const matchedHigh = highKeywords.filter((w) => text.includes(w));

    if (matchedCritical.length > 0 || input.customerTier === 'ENTERPRISE_MISSION_CRITICAL') {
      priority = JobPriority.CRITICAL;
      confidence = 0.95;
      matchedCritical.forEach((k) => risks.push(`High hazard keyword identified: "${k}"`));
      if (input.customerTier === 'ENTERPRISE_MISSION_CRITICAL') {
        risks.push('Customer account designated as Enterprise Mission-Critical SLA tier.');
      }
      reason = `Escalated to CRITICAL due to operational disruption risk: [${matchedCritical.join(', ') || 'Enterprise Tier'}].`;
    } else if (matchedHigh.length > 0 || input.customerTier === 'PREMIUM') {
      priority = JobPriority.HIGH;
      confidence = 0.88;
      matchedHigh.forEach((k) => risks.push(`Elevated risk keyword identified: "${k}"`));
      reason = `Assigned HIGH priority based on hardware degradation indicator: [${matchedHigh.join(', ')}].`;
    } else if (text.includes('routine') || text.includes('inspection') || text.includes('filter') || text.includes('annual')) {
      priority = JobPriority.LOW;
      confidence = 0.85;
      risks.push('Maintenance scheduled within standard non-urgent window.');
      reason = 'Routine preventive maintenance identified; low operational impact.';
    }

    // SLA Due Date check
    if (input.dueDate) {
      const due = new Date(input.dueDate);
      const hoursUntilDue = (due.getTime() - Date.now()) / (3600 * 1000);
      if (hoursUntilDue <= 4 && hoursUntilDue > 0) {
        risks.push(`Imminent SLA due window: ${Math.round(hoursUntilDue)} hours remaining.`);
        if (priority === JobPriority.MEDIUM || priority === JobPriority.LOW) {
          priority = JobPriority.HIGH;
          reason += ' Elevated due to tight SLA window (< 4 hours).';
        }
      } else if (hoursUntilDue <= 0) {
        risks.push('Target SLA timestamp is already past due.');
      }
    }

    if (risks.length === 0) {
      risks.push('Normal operational parameters; follow standard service route.');
    }

    return {
      suggestedPriority: priority,
      confidence,
      reasoning: reason,
      riskFactors: risks,
      provider: 'deterministic-fallback',
    };
  }
}
