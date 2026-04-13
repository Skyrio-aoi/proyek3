import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Calculate distance between two GPS points using Haversine formula (result in meters)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Check if given coordinates are within the radius of any office location
 */
async function isWithinOfficeLocation(
  latitude: number,
  longitude: number
): Promise<{ valid: boolean; locationName?: string; distance?: number; requiredRadius?: number }> {
  const locations = await db.officeLocation.findMany()

  for (const loc of locations) {
    const distance = haversineDistance(latitude, longitude, loc.latitude, loc.longitude)
    if (distance <= loc.radius) {
      return {
        valid: true,
        locationName: loc.name,
        distance: Math.round(distance * 100) / 100,
        requiredRadius: loc.radius,
      }
    }
  }

  return { valid: false }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET /api/attendance?userId=xxx or /api/attendance?action=all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')

    // Admin: get all attendance records
    if (action === 'all') {
      const records = await db.attendance.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { date: 'desc' },
      })

      return NextResponse.json(
        { success: true, data: records },
        { status: 200, headers: corsHeaders }
      )
    }

    // Get user's attendance history
    if (userId) {
      const records = await db.attendance.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      })

      return NextResponse.json(
        { success: true, data: records },
        { status: 200, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Provide userId or action=all' },
      { status: 400, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance records' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/attendance - Check in or check out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, latitude, longitude, locationName } = body

    if (!action || !userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'action, userId, latitude, and longitude are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Validate GPS coordinates
    const locationCheck = await isWithinOfficeLocation(
      parseFloat(latitude),
      parseFloat(longitude)
    )

    if (!locationCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are not within the office location. GPS validation failed.',
          validLocation: false,
        },
        { status: 403, headers: corsHeaders }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // CHECK IN
    if (action === 'checkin') {
      // Check if already checked in today
      const existingRecord = await db.attendance.findFirst({
        where: {
          userId,
          date: { gte: today, lt: tomorrow },
        },
      })

      if (existingRecord && existingRecord.checkInTime) {
        return NextResponse.json(
          {
            success: false,
            error: 'Already checked in today',
            data: existingRecord,
          },
          { status: 400, headers: corsHeaders }
        )
      }

      const now = new Date()
      // Determine status based on check-in time (09:00 is considered late)
      const hour = now.getHours()
      const status = hour >= 9 ? 'late' : 'present'

      let record: import('@prisma/client').Attendance

      if (existingRecord) {
        // Update existing record (e.g., created but no check-in time)
        record = await db.attendance.update({
          where: { id: existingRecord.id },
          data: {
            checkInTime: now,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            status,
            locationName: locationName || locationCheck.locationName,
          },
        })
      } else {
        // Create new record
        record = await db.attendance.create({
          data: {
            userId,
            date: now,
            checkInTime: now,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            status,
            locationName: locationName || locationCheck.locationName,
          },
        })
      }

      return NextResponse.json(
        {
          success: true,
          data: record,
          validLocation: true,
          locationInfo: locationCheck,
        },
        { status: 201, headers: corsHeaders }
      )
    }

    // CHECK OUT
    if (action === 'checkout') {
      const todayRecord = await db.attendance.findFirst({
        where: {
          userId,
          date: { gte: today, lt: tomorrow },
        },
      })

      if (!todayRecord || !todayRecord.checkInTime) {
        return NextResponse.json(
          { success: false, error: 'Not checked in yet. Please check in first.' },
          { status: 400, headers: corsHeaders }
        )
      }

      if (todayRecord.checkOutTime) {
        return NextResponse.json(
          { success: false, error: 'Already checked out today', data: todayRecord },
          { status: 400, headers: corsHeaders }
        )
      }

      const now = new Date()
      const record = await db.attendance.update({
        where: { id: todayRecord.id },
        data: {
          checkOutTime: now,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          locationName: locationName || locationCheck.locationName,
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: record,
          validLocation: true,
          locationInfo: locationCheck,
        },
        { status: 200, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use checkin or checkout.' },
      { status: 400, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Attendance error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process attendance' },
      { status: 500, headers: corsHeaders }
    )
  }
}
