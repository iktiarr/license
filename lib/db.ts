import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://dummy:dummy@localhost:5432/dummy';
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Export dynamic Proxy to ensure fresh PrismaClient models (user, project, logs, planSetting, userLog) in development hot-reloading
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    let client = getPrismaClient();
    let val = Reflect.get(client, prop, client);
    if (val === undefined && typeof prop === 'string' && prop !== 'then') {
      // Auto-refresh client instance in case new models (like userLog) were generated during hot-reloading
      globalForPrisma.prisma = createPrismaClient();
      client = globalForPrisma.prisma;
      val = Reflect.get(client, prop, client);
    }
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});
