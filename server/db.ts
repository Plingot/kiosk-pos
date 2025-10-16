import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { db: PrismaClient }

export const db =
  globalForPrisma.db ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db
}
