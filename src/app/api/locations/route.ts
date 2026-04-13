import { NextRequest, NextResponse } from 'next/server'
import { getAll, getOne, query } from '@/lib/db'

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, latitude, longitude, radius } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID lokasi wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const existing = await getOne('SELECT id FROM OfficeLocation WHERE id = ?', [id])
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lokasi tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }
    const fields: string[] = []
    const params: unknown[] = []
    if (name !== undefined) { fields.push('name = ?'); params.push(name) }
    if (latitude !== undefined) { fields.push('latitude = ?'); params.push(parseFloat(latitude)) }
    if (longitude !== undefined) { fields.push('longitude = ?'); params.push(parseFloat(longitude)) }
    if (radius !== undefined) { fields.push('radius = ?'); params.push(parseFloat(radius)) }
    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field untuk diupdate' }, { status: 400, headers: corsHeaders })
    }
    params.push(id)
    await query(`UPDATE OfficeLocation SET ${fields.join(', ')} WHERE id = ?`, params)
    const location = await getOne('SELECT * FROM OfficeLocation WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: location }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Update location error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengupdate lokasi' }, { status: 500, headers: corsHeaders })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID lokasi wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const existing = await getOne('SELECT id FROM OfficeLocation WHERE id = ?', [id])
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lokasi tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }
    await query('DELETE FROM OfficeLocation WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: { message: 'Lokasi berhasil dihapus' } }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Delete location error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal menghapus lokasi' }, { status: 500, headers: corsHeaders })
  }
}
