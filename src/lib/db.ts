import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'mysql://avnadmin:AVNS_cH993uJXj18aZK3KZj4@mysql-23b8d199-sitizahrah256-366a.e.aivencloud.com:25717/defaultdb',
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
