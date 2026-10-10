import { Prisma, JobStatus, JobPriority, Role } from '@prisma/client';
import prisma from '../prisma';
import {
  CreateJobInput,
  UpdateJobInput,
  UpdateJobStatusInput,
  QueryJobsInput,
  CreateJobNoteInput,
} from '../schemas/job.schema';
import { AppError } from '../middleware/errorHandler.middleware';
import { AuthenticatedUser } from '../types';

export class JobService {
  static async listJobs(query: QueryJobsInput, user: AuthenticatedUser) {
    const { status, priority, technicianId, customerId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {};

    // RBAC: Technicians are strictly locked to their own assigned jobs
    if (user.role === Role.TECHNICIAN) {
      where.assignedTechnicianId = user.id;
    } else if (technicianId) {
      where.assignedTechnicianId = technicianId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { jobNumber: { contains: term, mode: 'insensitive' } },
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { serviceAddress: { contains: term, mode: 'insensitive' } },
        { customer: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          customer: {
            select: { id: true, name: true, company: true, phone: true, email: true, address: true },
          },
          assignedTechnician: {
            select: { id: true, name: true, email: true, phone: true },
          },
          _count: {
            select: { notes: true, attachments: true },
          },
        },
      }),
    ]);

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getJobById(jobId: string, user: AuthenticatedUser) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: true,
        assignedTechnician: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            technicianProfile: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploader: { select: { id: true, name: true } },
          },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!job) {
      throw new AppError('Job record not found', 404, 'NOT_FOUND');
    }

    // Role security check: technician cannot view jobs assigned to another technician
    if (user.role === Role.TECHNICIAN && job.assignedTechnicianId !== user.id) {
      throw new AppError('Access forbidden: You are not assigned to this work order', 403, 'FORBIDDEN');
    }

    return job;
  }

  static async createJob(input: CreateJobInput, creatorId: string) {
    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) {
      throw new AppError('Customer not found', 404, 'NOT_FOUND');
    }

    // Generate unique readable job number (e.g. JOB-2026-0117)
    const year = new Date().getFullYear();
    const count = await prisma.job.count();
    const jobNumber = `JOB-${year}-${String(count + 101).padStart(4, '0')}`;

    const initialStatus = input.assignedTechnicianId ? JobStatus.ASSIGNED : JobStatus.OPEN;

    const job = await prisma.job.create({
      data: {
        jobNumber,
        title: input.title,
        description: input.description,
        customerId: input.customerId,
        assignedTechnicianId: input.assignedTechnicianId || null,
        serviceAddress: input.serviceAddress,
        latitude: input.latitude,
        longitude: input.longitude,
        priority: input.priority,
        status: initialStatus,
        scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        createdById: creatorId,
      },
      include: {
        customer: true,
        assignedTechnician: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        jobId: job.id,
        actorId: creatorId,
        action: 'JOB_CREATED',
        metadata: JSON.stringify({ jobNumber, priority: job.priority, status: job.status }),
      },
    });

    return job;
  }

  static async updateJob(jobId: string, input: UpdateJobInput, actorId: string) {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.customerId && { customerId: input.customerId }),
        ...(input.assignedTechnicianId !== undefined && {
          assignedTechnicianId: input.assignedTechnicianId,
          status:
            existing.status === JobStatus.OPEN && input.assignedTechnicianId
              ? JobStatus.ASSIGNED
              : existing.status,
        }),
        ...(input.serviceAddress && { serviceAddress: input.serviceAddress }),
        ...(input.latitude !== undefined && { latitude: input.latitude }),
        ...(input.longitude !== undefined && { longitude: input.longitude }),
        ...(input.priority && { priority: input.priority }),
        ...(input.status && { status: input.status }),
        ...(input.scheduledStart !== undefined && {
          scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
        }),
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
      },
      include: {
        customer: true,
        assignedTechnician: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        jobId,
        actorId,
        action: 'JOB_UPDATED',
        metadata: JSON.stringify(input),
      },
    });

    return updated;
  }

  static async updateJobStatus(
    jobId: string,
    input: UpdateJobStatusInput,
    user: AuthenticatedUser
  ) {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    // Authorization check
    if (user.role === Role.TECHNICIAN && existing.assignedTechnicianId !== user.id) {
      throw new AppError('You can only update status for jobs assigned to you', 403, 'FORBIDDEN');
    }

    // State machine sanity checks
    if (existing.status === JobStatus.COMPLETED && input.status === JobStatus.OPEN) {
      throw new AppError('Completed jobs cannot be reverted directly to open status', 400, 'INVALID_TRANSITION');
    }

    const updates: Prisma.JobUpdateInput = {
      status: input.status,
    };

    if (input.status === JobStatus.IN_PROGRESS && !existing.startedAt) {
      updates.startedAt = new Date();
    } else if (input.status === JobStatus.COMPLETED) {
      updates.completedAt = new Date();
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: updates,
      include: {
        customer: true,
        assignedTechnician: { select: { id: true, name: true, email: true } },
      },
    });

    // Record activity log
    await prisma.activityLog.create({
      data: {
        jobId,
        actorId: user.id,
        action: 'STATUS_UPDATED',
        metadata: JSON.stringify({ from: existing.status, to: input.status }),
      },
    });

    // Record optional field note
    if (input.note && input.note.trim()) {
      await prisma.jobNote.create({
        data: {
          jobId,
          authorId: user.id,
          content: input.note.trim(),
          isInternal: false,
        },
      });
    }

    return updated;
  }

  static async assignJob(jobId: string, technicianId: string | null, actorId: string) {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    if (technicianId) {
      const tech = await prisma.user.findUnique({
        where: { id: technicianId },
        include: { technicianProfile: true },
      });
      if (!tech || tech.role !== Role.TECHNICIAN) {
        throw new AppError('Selected user is not a valid field technician', 400, 'INVALID_TECHNICIAN');
      }
    }

    const newStatus =
      technicianId && existing.status === JobStatus.OPEN
        ? JobStatus.ASSIGNED
        : !technicianId && existing.status === JobStatus.ASSIGNED
        ? JobStatus.OPEN
        : existing.status;

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        assignedTechnicianId: technicianId,
        status: newStatus,
      },
      include: {
        assignedTechnician: { select: { id: true, name: true, email: true } },
        customer: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        jobId,
        actorId,
        action: 'TECHNICIAN_ASSIGNED',
        metadata: JSON.stringify({ assignedTechnicianId: technicianId, status: newStatus }),
      },
    });

    return updated;
  }

  static async addJobNote(
    jobId: string,
    input: CreateJobNoteInput,
    user: AuthenticatedUser
  ) {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    if (user.role === Role.TECHNICIAN && existing.assignedTechnicianId !== user.id) {
      throw new AppError('You cannot add notes to unassigned jobs', 403, 'FORBIDDEN');
    }

    const note = await prisma.jobNote.create({
      data: {
        jobId,
        authorId: user.id,
        content: input.content,
        isInternal: input.isInternal,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        jobId,
        actorId: user.id,
        action: 'NOTE_ADDED',
        metadata: JSON.stringify({ noteId: note.id, isInternal: input.isInternal }),
      },
    });

    return note;
  }

  static async addAttachment(
    jobId: string,
    file: { filename: string; originalname: string; mimetype: string; size: number },
    uploaderId: string
  ) {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) {
      throw new AppError('Job not found', 404, 'NOT_FOUND');
    }

    const attachment = await prisma.jobAttachment.create({
      data: {
        jobId,
        uploaderId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
      },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        jobId,
        actorId: uploaderId,
        action: 'ATTACHMENT_UPLOADED',
        metadata: JSON.stringify({ fileName: file.originalname, size: file.size }),
      },
    });

    return attachment;
  }
}
