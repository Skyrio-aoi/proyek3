import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL || 'mysql://avnadmin:AVNS_cH993uJXj18aZK3KZj4@mysql-23b8d199-sitizahrah256-366a.e.aivencloud.com:25717/defaultdb'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    // For Aiven MySQL with self-signed cert, disable strict cert verification
    ...(process.env.NODE_ENV === 'development' ? {} : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
