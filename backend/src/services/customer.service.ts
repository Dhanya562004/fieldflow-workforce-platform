import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { CreateCustomerInput, UpdateCustomerInput } from '../schemas/customer.schema';
import { AppError } from '../middleware/errorHandler.middleware';

export class CustomerService {
  static async listCustomers(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { address: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { jobs: true },
          },
        },
      }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTechnician: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404, 'NOT_FOUND');
    }

    return customer;
  }

  static async createCustomer(input: CreateCustomerInput) {
    const customer = await prisma.customer.create({
      data: {
        name: input.name,
        company: input.company,
        email: input.email.toLowerCase(),
        phone: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
      },
    });

    return customer;
  }

  static async updateCustomer(id: string, input: UpdateCustomerInput) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Customer not found', 404, 'NOT_FOUND');
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.company !== undefined && { company: input.company }),
        ...(input.email && { email: input.email.toLowerCase() }),
        ...(input.phone && { phone: input.phone }),
        ...(input.address && { address: input.address }),
        ...(input.city && { city: input.city }),
        ...(input.state && { state: input.state }),
        ...(input.postalCode && { postalCode: input.postalCode }),
        ...(input.latitude !== undefined && { latitude: input.latitude }),
        ...(input.longitude !== undefined && { longitude: input.longitude }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });

    return customer;
  }
}
