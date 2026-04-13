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

// GET /api/rides?status=active
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    let sql = 'SELECT * FROM Ride'
    const params: unknown[] = []
    if (status) {
      sql += ' WHERE status = ?'
      params.push(status)
    }
    sql += ' ORDER BY createdAt DESC'
    const rides = await getAll(sql, params)
    return NextResponse.json({ success: true, data: rides }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Get rides error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data wahana' }, { status: 500, headers: corsHeaders })
  }
}

// POST /api/rides - Create ride (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, imageUrl, category, heightMin, heightMax, durationMinutes, status } = body
    if (!name || !description) {
      return NextResponse.json({ success: false, error: 'Nama dan deskripsi wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
    await query(
      'INSERT INTO Ride (id, name, description, imageUrl, status, category, heightMin, heightMax, durationMinutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, description, imageUrl || null, status || 'active', category || 'family', heightMin || null, heightMax || null, durationMinutes || null]
    )
    const ride = await getOne('SELECT * FROM Ride WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: ride }, { status: 201, headers: corsHeaders })
  } catch (error: any) {
    console.error('Create ride error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal membuat wahana' }, { status: 500, headers: corsHeaders })
  }
}

// PUT /api/rides - Update ride (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, imageUrl, status, category, heightMin, heightMax, durationMinutes } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID wahana wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const existing = await getOne('SELECT id FROM Ride WHERE id = ?', [id])
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Wahana tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }
    const fields: string[] = []
    const params: unknown[] = []
    if (name !== undefined) { fields.push('name = ?'); params.push(name) }
    if (description !== undefined) { fields.push('description = ?'); params.push(description) }
    if (imageUrl !== undefined) { fields.push('imageUrl = ?'); params.push(imageUrl) }
    if (status !== undefined) { fields.push('status = ?'); params.push(status) }
    if (category !== undefined) { fields.push('category = ?'); params.push(category) }
    if (heightMin !== undefined) { fields.push('heightMin = ?'); params.push(heightMin) }
    if (heightMax !== undefined) { fields.push('heightMax = ?'); params.push(heightMax) }
    if (durationMinutes !== undefined) { fields.push('durationMinutes = ?'); params.push(durationMinutes) }
    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field untuk diupdate' }, { status: 400, headers: corsHeaders })
    }
    params.push(id)
    await query(`UPDATE Ride SET ${fields.join(', ')} WHERE id = ?`, params)
    const ride = await getOne('SELECT * FROM Ride WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: ride }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Update ride error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengupdate wahana' }, { status: 500, headers: corsHeaders })
  }
}

// DELETE /api/rides - Delete ride (admin)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID wahana wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const existing = await getOne('SELECT id FROM Ride WHERE id = ?', [id])
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Wahana tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }
    await query('DELETE FROM Ride WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: { message: 'Wahana berhasil dihapus' } }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Delete ride error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal menghapus wahana' }, { status: 500, headers: corsHeaders })
  }
}
