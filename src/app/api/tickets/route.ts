import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET /api/tickets - list active ticket types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('all') === 'true'

    const where: Record<string, unknown> = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const ticketTypes = await db.ticketType.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: ticketTypes },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket types' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/tickets - Create ticket type (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, isActive } = body

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const ticketType = await db.ticketType.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(
      { success: true, data: ticketType },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Create ticket type error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket type' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PUT /api/tickets - Update ticket type (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ticket type ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const existing = await db.ticketType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ticket type not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (fields.name !== undefined) updateData.name = fields.name
    if (fields.description !== undefined) updateData.description = fields.description
    if (fields.price !== undefined) updateData.price = parseFloat(fields.price)
    if (fields.isActive !== undefined) updateData.isActive = fields.isActive

    const ticketType = await db.ticketType.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(
      { success: true, data: ticketType },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Update ticket type error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket type' },
      { status: 500, headers: corsHeaders }
    )
  }
}
