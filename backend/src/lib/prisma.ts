import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  // Add connection timeout and retry settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Don't auto-connect in production - let the server handle connection with retry logic
// This prevents blocking server startup if database is temporarily unavailable
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      console.error('❌ Check DATABASE_URL environment variable');
    });
}

export { PrismaClient };
