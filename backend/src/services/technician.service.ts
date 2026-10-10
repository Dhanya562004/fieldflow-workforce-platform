import bcrypt from 'bcryptjs';
import { Role, JobStatus } from '@prisma/client';
import prisma from '../prisma';
import { CreateTechnicianInput, UpdateTechnicianInput } from '../schemas/technician.schema';
import { AppError } from '../middleware/errorHandler.middleware';

export class TechnicianService {
  static async listTechnicians() {
    const technicians = await prisma.user.findMany({
      where: {
        role: Role.TECHNICIAN,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        technicianProfile: true,
        assignedJobs: {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            priority: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return technicians.map((tech) => {
      const activeJobs = tech.assignedJobs.filter(
        (j) => j.status === JobStatus.ASSIGNED || j.status === JobStatus.IN_PROGRESS
      );
      const completedJobs = tech.assignedJobs.filter((j) => j.status === JobStatus.COMPLETED);

      return {
        id: tech.id,
        name: tech.name,
        email: tech.email,
        phone: tech.phone,
        profile: tech.technicianProfile,
        activeJobsCount: activeJobs.length,
        completedJobsCount: completedJobs.length,
        activeJobs,
        isAvailable: tech.technicianProfile?.isAvailable ?? true,
        workloadUtilization: tech.technicianProfile?.maxConcurrentJobs
          ? Math.round((activeJobs.length / tech.technicianProfile.maxConcurrentJobs) * 100)
          : 0,
      };
    });
  }

  static async getTechnicianById(id: string) {
    const tech = await prisma.user.findFirst({
      where: { id, role: Role.TECHNICIAN },
      include: {
        technicianProfile: true,
        assignedJobs: {
          orderBy: { dueDate: 'asc' },
          include: { customer: { select: { id: true, name: true, address: true } } },
        },
      },
    });

    if (!tech) {
      throw new AppError('Technician not found', 404, 'NOT_FOUND');
    }

    const activeJobs = tech.assignedJobs.filter(
      (j) => j.status === JobStatus.ASSIGNED || j.status === JobStatus.IN_PROGRESS
    );
    const completedJobs = tech.assignedJobs.filter((j) => j.status === JobStatus.COMPLETED);

    return {
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      profile: tech.technicianProfile,
      activeJobsCount: activeJobs.length,
      completedJobsCount: completedJobs.length,
      activeJobs,
      completedJobs: completedJobs.slice(0, 10),
    };
  }

  static async createTechnician(input: CreateTechnicianInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) {
      throw new AppError('A user with this email already exists', 409, 'CONFLICT');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: Role.TECHNICIAN,
        phone: input.phone,
        isActive: true,
        technicianProfile: {
          create: {
            skills: input.skills,
            vehicleNumber: input.vehicleNumber,
            serviceZone: input.serviceZone,
            maxConcurrentJobs: input.maxConcurrentJobs,
            isAvailable: input.isAvailable,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        technicianProfile: true,
      },
    });

    return user;
  }

  static async updateTechnician(id: string, input: UpdateTechnicianInput) {
    const tech = await prisma.user.findFirst({
      where: { id, role: Role.TECHNICIAN },
    });
    if (!tech) {
      throw new AppError('Technician not found', 404, 'NOT_FOUND');
    }

    if (input.name || input.phone) {
      await prisma.user.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.phone && { phone: input.phone }),
        },
      });
    }

    const profileData: any = {};
    if (input.skills !== undefined) profileData.skills = input.skills;
    if (input.vehicleNumber !== undefined) profileData.vehicleNumber = input.vehicleNumber;
    if (input.serviceZone !== undefined) profileData.serviceZone = input.serviceZone;
    if (input.maxConcurrentJobs !== undefined) profileData.maxConcurrentJobs = input.maxConcurrentJobs;
    if (input.isAvailable !== undefined) profileData.isAvailable = input.isAvailable;

    if (Object.keys(profileData).length > 0) {
      await prisma.technicianProfile.upsert({
        where: { userId: id },
        update: profileData,
        create: {
          userId: id,
          skills: input.skills || 'General Maintenance',
          ...profileData,
        },
      });
    }

    return this.getTechnicianById(id);
  }
}
