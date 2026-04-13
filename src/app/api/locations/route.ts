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

// GET /api/locations - list all office locations
export async function GET() {
  try {
    const locations = await db.officeLocation.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(
      { success: true, data: locations },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch office locations' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/locations - Create office location (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, latitude, longitude, radius } = body

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, latitude, and longitude are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const location = await db.officeLocation.create({
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: radius ? parseFloat(radius) : 10,
      },
    })

    return NextResponse.json(
      { success: true, data: location },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Create location error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create office location' },
      { status: 500, headers: corsHeaders }
    )
  }
}
