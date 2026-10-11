import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Cache instance on global object in both serverless and dev environments
// to prevent multiple PrismaClient instances during container reuse
globalThis.prismaGlobal = prisma;


export default prisma;
