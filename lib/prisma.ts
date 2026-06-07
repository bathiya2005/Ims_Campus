import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma: any }

function createClient() {
  const url = process.env.DATABASE_URL!
  const isAiven = url.includes('aivencloud.com')

  // For Aiven, remove ssl-mode param (not supported by mariadb adapter)
  // and use plain connection — Aiven handles SSL at network level
  let connectionUrl = url
  if (isAiven) {
    connectionUrl = url
      .replace('?ssl-mode=REQUIRED', '')
      .replace('&ssl-mode=REQUIRED', '')
      .replace('ssl-mode=REQUIRED&', '')
  }

  const adapter = new PrismaMariaDb(connectionUrl)
  return new PrismaClient({ adapter })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPrismaClient(): Promise<any> {
  return prisma
}