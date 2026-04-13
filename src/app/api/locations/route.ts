import { NextRequest, NextResponse } from 'next/server'
import { getAll, query } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET() {
  try {
    const locations = await getAll('SELECT * FROM OfficeLocation ORDER BY name ASC')
    return NextResponse.json({ success: true, data: locations }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Get locations error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengambil lokasi' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, latitude, longitude, radius } = body
    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, error: 'Nama, latitude, dan longitude wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
    await query(
      'INSERT INTO OfficeLocation (id, name, latitude, longitude, radius) VALUES (?, ?, ?, ?, ?)',
      [id, name, parseFloat(latitude), parseFloat(longitude), radius ? parseFloat(radius) : 10]
    )
    const location = await getAll('SELECT * FROM OfficeLocation WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: location[0] }, { status: 201, headers: corsHeaders })
  } catch (error: any) {
    console.error('Create location error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal membuat lokasi' }, { status: 500, headers: corsHeaders })
  }
}
