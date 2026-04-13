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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('all') === 'true'
    let sql = 'SELECT * FROM TicketType'
    const params: unknown[] = []
    if (!includeInactive) {
      sql += ' WHERE isActive = true'
    }
    sql += ' ORDER BY price ASC'
    const tickets = await getAll(sql, params)
    return NextResponse.json({ success: true, data: tickets }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Get tickets error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data tiket' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, isActive } = body
    if (!name || price === undefined || price === null) {
      return NextResponse.json({ success: false, error: 'Nama dan harga wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
    await query(
      'INSERT INTO TicketType (id, name, description, price, isActive) VALUES (?, ?, ?, ?, ?)',
      [id, name, description || null, parseFloat(price), isActive !== undefined ? isActive : true]
    )
    const ticket = await getOne('SELECT * FROM TicketType WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: ticket }, { status: 201, headers: corsHeaders })
  } catch (error: any) {
    console.error('Create ticket error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal membuat tipe tiket' }, { status: 500, headers: corsHeaders })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, price, isActive } = body
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tipe tiket wajib diisi' }, { status: 400, headers: corsHeaders })
    }
    const existing = await getOne('SELECT id FROM TicketType WHERE id = ?', [id])
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Tipe tiket tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }
    const fields: string[] = []
    const params: unknown[] = []
    if (name !== undefined) { fields.push('name = ?'); params.push(name) }
    if (description !== undefined) { fields.push('description = ?'); params.push(description) }
    if (price !== undefined) { fields.push('price = ?'); params.push(parseFloat(price)) }
    if (isActive !== undefined) { fields.push('isActive = ?'); params.push(isActive ? 1 : 0) }
    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field untuk diupdate' }, { status: 400, headers: corsHeaders })
    }
    params.push(id)
    await query(`UPDATE TicketType SET ${fields.join(', ')} WHERE id = ?`, params)
    const ticket = await getOne('SELECT * FROM TicketType WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: ticket }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Update ticket error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengupdate tipe tiket' }, { status: 500, headers: corsHeaders })
  }
}
