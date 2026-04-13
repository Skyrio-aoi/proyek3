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

// GET /api/rides?status=active
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const rides = await db.ride.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      { success: true, data: rides },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Get rides error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rides' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/rides - Create ride (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, imageUrl, category, heightMin, heightMax, durationMinutes } = body

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const ride = await db.ride.create({
      data: {
        name,
        description,
        imageUrl: imageUrl || null,
        category: category || 'family',
        heightMin: heightMin ? parseInt(heightMin, 10) : null,
        heightMax: heightMax ? parseInt(heightMax, 10) : null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
      },
    })

    return NextResponse.json(
      { success: true, data: ride },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Create ride error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ride' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PUT /api/rides - Update ride (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ride ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const existing = await db.ride.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ride not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (fields.name !== undefined) updateData.name = fields.name
    if (fields.description !== undefined) updateData.description = fields.description
    if (fields.imageUrl !== undefined) updateData.imageUrl = fields.imageUrl
    if (fields.status !== undefined) updateData.status = fields.status
    if (fields.category !== undefined) updateData.category = fields.category
    if (fields.heightMin !== undefined)
      updateData.heightMin = fields.heightMin !== null ? parseInt(fields.heightMin, 10) : null
    if (fields.heightMax !== undefined)
      updateData.heightMax = fields.heightMax !== null ? parseInt(fields.heightMax, 10) : null
    if (fields.durationMinutes !== undefined)
      updateData.durationMinutes =
        fields.durationMinutes !== null ? parseInt(fields.durationMinutes, 10) : null

    const ride = await db.ride.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(
      { success: true, data: ride },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Update ride error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ride' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// DELETE /api/rides - Delete ride (admin)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ride ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const existing = await db.ride.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ride not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    await db.ride.delete({ where: { id } })

    return NextResponse.json(
      { success: true, data: { message: 'Ride deleted successfully' } },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Delete ride error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete ride' },
      { status: 500, headers: corsHeaders }
    )
  }
}
