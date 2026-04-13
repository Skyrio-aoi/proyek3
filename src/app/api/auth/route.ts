import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    // Profile action
    if (action === 'profile') {
      const { userId } = body
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID is required' },
          { status: 400, headers: corsHeaders }
        )
      }

      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404, headers: corsHeaders }
        )
      }

      return NextResponse.json(
        { success: true, data: user },
        { status: 200, headers: corsHeaders }
      )
    }

    // Main auth actions (no ?action query param)
    const { action: bodyAction, email, password, name, phone } = body

    if (!bodyAction) {
      return NextResponse.json(
        { success: false, error: 'Action is required (register or login)' },
        { status: 400, headers: corsHeaders }
      )
    }

    // REGISTER
    if (bodyAction === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Email, password, and name are required' },
          { status: 400, headers: corsHeaders }
        )
      }

      const existingUser = await db.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already registered' },
          { status: 409, headers: corsHeaders }
        )
      }

      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      const user = await db.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone: phone || null,
          role: 'visitor',
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return NextResponse.json(
        { success: true, data: user },
        { status: 201, headers: corsHeaders }
      )
    }

    // LOGIN
    if (bodyAction === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400, headers: corsHeaders }
        )
      }

      const user = await db.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401, headers: corsHeaders }
        )
      }

      const isValid = await bcrypt.compare(password, user.passwordHash)
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401, headers: corsHeaders }
        )
      }

      const { passwordHash: _, ...userWithoutPassword } = user

      return NextResponse.json(
        { success: true, data: userWithoutPassword },
        { status: 200, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use register, login, or profile.' },
      { status: 400, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
