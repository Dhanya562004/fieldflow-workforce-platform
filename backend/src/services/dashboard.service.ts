import { JobStatus, Role } from '@prisma/client';
import prisma from '../prisma';

export class DashboardService {
  static async getSummary() {
    const now = new Date();

    const [
      totalJobs,
      inProgress,
      completed,
      open,
      assigned,
      cancelled,
      overdueCount,
      activeTechnicians,
      criticalCount,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: JobStatus.IN_PROGRESS } }),
      prisma.job.count({ where: { status: JobStatus.COMPLETED } }),
      prisma.job.count({ where: { status: JobStatus.OPEN } }),
      prisma.job.count({ where: { status: JobStatus.ASSIGNED } }),
      prisma.job.count({ where: { status: JobStatus.CANCELLED } }),
      prisma.job.count({
        where: {
          dueDate: { lt: now },
          status: { notIn: [JobStatus.COMPLETED, JobStatus.CANCELLED] },
        },
      }),
      prisma.user.count({
        where: {
          role: Role.TECHNICIAN,
          isActive: true,
          technicianProfile: { isAvailable: true },
        },
      }),
      prisma.job.count({
        where: {
          priority: 'CRITICAL',
          status: { notIn: [JobStatus.COMPLETED, JobStatus.CANCELLED] },
        },
      }),
    ]);

    const nonCancelledTotal = totalJobs - cancelled;
    const completionRate = nonCancelledTotal > 0 ? Math.round((completed / nonCancelledTotal) * 100) : 0;
    const overdueRate = nonCancelledTotal > 0 ? Math.round((overdueCount / nonCancelledTotal) * 100) : 0;

    return {
      totalJobs,
      inProgress,
      completed,
      open,
      assigned,
      cancelled,
      overdue: overdueCount,
      unassigned: open,
      activeTechnicians,
      criticalActive: criticalCount,
      completionRate,
      overdueRate,
      timestamp: now.toISOString(),
    };
  }

  static async getJobTrends() {
    const now = new Date();
    const days: { date: string; created: number; completed: number }[] = [];

    // Aggregate trends for the last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const [created, completed] = await Promise.all([
        prisma.job.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        prisma.job.count({
          where: {
            completedAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
      ]);

      const label = startOfDay.toISOString().split('T')[0];
      days.push({ date: label, created, completed });
    }

    // Status breakdown
    const statusGroups = await prisma.job.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Priority breakdown
    const priorityGroups = await prisma.job.groupBy({
      by: ['priority'],
      _count: { id: true },
    });

    return {
      trends: days,
      byStatus: statusGroups.map((g) => ({ status: g.status, count: g._count.id })),
      byPriority: priorityGroups.map((g) => ({ priority: g.priority, count: g._count.id })),
    };
  }

  static async getWorkload() {
    const technicians = await prisma.user.findMany({
      where: { role: Role.TECHNICIAN, isActive: true },
      include: {
        technicianProfile: true,
        assignedJobs: {
          where: { status: { in: [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS] } },
          select: { id: true, priority: true, status: true, dueDate: true },
        },
      },
    });

    const unassignedCount = await prisma.job.count({
      where: { status: JobStatus.OPEN },
    });

    const now = new Date();
    const workload = technicians.map((t) => {
      const max = t.technicianProfile?.maxConcurrentJobs || 4;
      const activeCount = t.assignedJobs.length;
      const criticalCount = t.assignedJobs.filter((j) => j.priority === 'CRITICAL').length;
      const overdueCount = t.assignedJobs.filter((j) => j.dueDate && new Date(j.dueDate) < now).length;
      const utilizationPercent = Math.min(100, Math.round((activeCount / max) * 100));

      return {
        technicianId: t.id,
        name: t.name,
        zone: t.technicianProfile?.serviceZone || 'Metro',
        maxCapacity: max,
        activeJobs: activeCount,
        criticalJobs: criticalCount,
        overdueJobs: overdueCount,
        utilizationPercent,
        status:
          utilizationPercent >= 100
            ? 'OVERLOADED'
            : utilizationPercent >= 75
            ? 'HIGH_LOAD'
            : utilizationPercent >= 25
            ? 'BALANCED'
            : 'UNDER_UTILIZED',
      };
    });

    return {
      workload,
      unassignedJobs: unassignedCount,
      timestamp: now.toISOString(),
    };
  }
}
