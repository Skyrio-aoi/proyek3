import { NextRequest, NextResponse } from 'next/server'
import { getOne, getAll, query } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')

    if (action === 'all') {
      const records = await getAll(`
        SELECT a.*, u.name as userName, u.email as userEmail, u.role as userRole
        FROM Attendance a LEFT JOIN User u ON a.userId = u.id
        ORDER BY a.date DESC
      `)
      return NextResponse.json({ success: true, data: records }, { status: 200, headers: corsHeaders })
    }

    if (userId) {
      const records = await getAll('SELECT * FROM Attendance WHERE userId = ? ORDER BY date DESC', [userId])
      return NextResponse.json({ success: true, data: records }, { status: 200, headers: corsHeaders })
    }

    return NextResponse.json({ success: false, error: 'Berikan userId atau action=all' }, { status: 400, headers: corsHeaders })
  } catch (error: any) {
    console.error('Get attendance error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data absensi' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, latitude, longitude, locationName } = body

    if (!action || !userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400, headers: corsHeaders })
    }

    const user = await getOne('SELECT id FROM User WHERE id = ?', [userId])
    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }

    // GPS validation
    const locations = await getAll('SELECT * FROM OfficeLocation')
    let locationValid = false
    let locName = ''
    let distance = 0
    let requiredRadius = 10

    for (const loc of locations) {
      const dist = haversineDistance(parseFloat(latitude), parseFloat(longitude), loc.latitude, loc.longitude)
      if (dist <= loc.radius) {
        locationValid = true
        locName = loc.name
        distance = Math.round(dist * 100) / 100
        requiredRadius = loc.radius
        break
      }
    }

    if (!locationValid) {
      return NextResponse.json({ success: false, error: 'Anda berada di luar area kantor. Absensi gagal.', validLocation: false }, { status: 403, headers: corsHeaders })
    }

    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    if (action === 'checkin') {
      // Check if already checked in today
      const existing = await getOne(
        "SELECT * FROM Attendance WHERE userId = ? AND DATE(date) = ?",
        [userId, todayStr]
      )

      if (existing && existing.checkInTime) {
        return NextResponse.json({ success: false, error: 'Sudah absen masuk hari ini', data: existing }, { status: 400, headers: corsHeaders })
      }

      const hour = now.getHours()
      const status = hour >= 9 ? 'late' : 'present'
      const loc = locationName || locName

      if (existing) {
        await query(
          'UPDATE Attendance SET checkInTime = ?, latitude = ?, longitude = ?, status = ?, locationName = ? WHERE id = ?',
          [now, lat, lon, status, loc, existing.id]
        )
      } else {
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
        await query(
          'INSERT INTO Attendance (id, userId, date, checkInTime, latitude, longitude, status, locationName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, now, now, lat, lon, status, loc]
        )
      }

      const record = await getOne(
        "SELECT * FROM Attendance WHERE userId = ? AND DATE(date) = ?",
        [userId, todayStr]
      )

      return NextResponse.json({ success: true, data: record, validLocation: true, locationInfo: { locationName: locName, distance, requiredRadius } }, { status: 201, headers: corsHeaders })
    }

    if (action === 'checkout') {
      const todayRecord = await getOne(
        "SELECT * FROM Attendance WHERE userId = ? AND DATE(date) = ?",
        [userId, todayStr]
      )

      if (!todayRecord || !todayRecord.checkInTime) {
        return NextResponse.json({ success: false, error: 'Belum absen masuk. Silakan absen masuk terlebih dahulu.' }, { status: 400, headers: corsHeaders })
      }
      if (todayRecord.checkOutTime) {
        return NextResponse.json({ success: false, error: 'Sudah absen keluar hari ini', data: todayRecord }, { status: 400, headers: corsHeaders })
      }

      await query(
        'UPDATE Attendance SET checkOutTime = ?, latitude = ?, longitude = ?, locationName = ? WHERE id = ?',
        [now, lat, lon, locationName || locName, todayRecord.id]
      )

      const record = await getOne('SELECT * FROM Attendance WHERE id = ?', [todayRecord.id])
      return NextResponse.json({ success: true, data: record, validLocation: true, locationInfo: { locationName: locName, distance, requiredRadius } }, { status: 200, headers: corsHeaders })
    }

    return NextResponse.json({ success: false, error: 'Action tidak valid. Gunakan checkin atau checkout.' }, { status: 400, headers: corsHeaders })
  } catch (error: any) {
    console.error('Attendance error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal memproses absensi' }, { status: 500, headers: corsHeaders })
  }
}
