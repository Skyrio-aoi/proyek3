import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

let pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (pool) return pool

  const caPath = path.join(process.cwd(), 'certs', 'ca.pem')
  let ssl: { ca: string } | { rejectUnauthorized: false }
  
  try {
    const ca = fs.readFileSync(caPath, 'utf8')
    ssl = { ca }
    console.log('[DB] Using Aiven CA certificate from', caPath)
  } catch {
    ssl = { rejectUnauthorized: false }
    console.log('[DB] CA cert not found, using rejectUnauthorized: false')
  }

  const dbUrl = process.env.DATABASE_URL || ''
  const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  
  if (urlMatch) {
    pool = mysql.createPool({
      host: urlMatch[3],
      port: parseInt(urlMatch[4]),
      user: urlMatch[1],
      password: urlMatch[2],
      database: urlMatch[5],
      ssl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  } else {
    throw new Error('Invalid DATABASE_URL format')
  }

  return pool
}

export const db = getPool()

export async function query(sql: string, params?: unknown[]) {
  const conn = await db.getConnection()
  try {
    const [results] = await conn.execute(sql, params)
    return results as any
  } finally {
    conn.release()
  }
}

export async function getOne<T = any>(sql: string, params?: unknown[]): Promise<T | null> {
  const results = await query(sql, params)
  if (Array.isArray(results) && results.length > 0) return results[0] as T
  return null
}

export async function getAll<T = any>(sql: string, params?: unknown[]): Promise<T[]> {
  const results = await query(sql, params)
  return (Array.isArray(results) ? results : []) as T[]
}
