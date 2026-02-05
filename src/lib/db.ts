import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

function createPrismaClient() {
  // Crear pool solo si no existe (reutilización en serverless)
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      // Optimizaciones para Azure Static Web Apps (serverless)
      max: 1, // Solo 1 conexión en ambiente serverless
      idleTimeoutMillis: 30000, // 30 segundos idle timeout
      connectionTimeoutMillis: 5000, // Timeout rápido para evitar warm-up timeout
    })
  }

  const adapter = new PrismaPg(globalForPrisma.pool)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
