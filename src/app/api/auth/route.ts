import { NextRequest, NextResponse } from 'next/server'
import { getOne, getAll, query } from '@/lib/db'
import bcrypt from 'bcryptjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// POST /api/auth?action=register|login|profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name, phone, userId } = body

    // GET PROFILE
    if (action === 'profile') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400, headers: corsHeaders })
      }
      const user = await getOne(
        'SELECT id, email, name, phone, role, avatar, createdAt, updatedAt FROM User WHERE id = ?',
        [userId]
      )
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404, headers: corsHeaders })
      }
      return NextResponse.json({ success: true, data: user }, { status: 200, headers: corsHeaders })
    }

    // REGISTER
    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json({ success: false, error: 'Email, password, dan nama wajib diisi' }, { status: 400, headers: corsHeaders })
      }
      const existing = await getOne('SELECT id FROM User WHERE email = ?', [email])
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 409, headers: corsHeaders })
      }
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)
      const result = await query(
        'INSERT INTO User (id, email, passwordHash, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36), email, passwordHash, name, phone || null, 'visitor']
      )
      const insertId = (result as any).insertId
      const user = await getOne(
        'SELECT id, email, name, phone, role, avatar, createdAt, updatedAt FROM User WHERE id = ?',
        [insertId]
      )
      return NextResponse.json({ success: true, data: user }, { status: 201, headers: corsHeaders })
    }

    // LOGIN
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email dan password wajib diisi' }, { status: 400, headers: corsHeaders })
      }
      const user = await getOne('SELECT * FROM User WHERE email = ?', [email])
      if (!user) {
        return NextResponse.json({ success: false, error: 'Email atau password salah' }, { status: 401, headers: corsHeaders })
      }
      const isValid = await bcrypt.compare(password, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Email atau password salah' }, { status: 401, headers: corsHeaders })
      }
      const { passwordHash: _, ...userWithoutPassword } = user
      return NextResponse.json({ success: true, data: userWithoutPassword }, { status: 200, headers: corsHeaders })
    }

    return NextResponse.json({ success: false, error: 'Action tidak valid. Gunakan register, login, atau profile.' }, { status: 400, headers: corsHeaders })
  } catch (error: any) {
    console.error('Auth error:', error?.message || error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server: ' + (error?.message || 'unknown') }, { status: 500, headers: corsHeaders })
  }
}
