import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaInstance: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPrisma(): Promise<any> {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client')
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

export const prisma = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $queryRaw: async (...args: any[]) => (await getPrisma()).$queryRaw(...args),
} as never

export async function getPrismaClient() {
  return getPrisma()
}