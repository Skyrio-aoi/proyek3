import { NextRequest, NextResponse } from 'next/server'
import { getOne, getAll, query } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderCode } = body
    if (!orderCode) {
      return NextResponse.json({ success: false, error: 'Kode pesanan wajib diisi' }, { status: 400, headers: corsHeaders })
    }

    const order = await getOne(`
      SELECT o.*, u.name as userName, u.email as userEmail, u.phone as userPhone
      FROM \`Order\` o LEFT JOIN User u ON o.userId = u.id
      WHERE o.orderCode = ?
    `, [orderCode])

    if (!order) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan', valid: false }, { status: 404, headers: corsHeaders })
    }

    order.orderItems = await getAll(
      'SELECT oi.*, tt.name as ticketTypeName FROM OrderItem oi LEFT JOIN TicketType tt ON oi.ticketTypeId = tt.id WHERE oi.orderId = ?',
      [order.id]
    )

    if (order.status === 'used') {
      return NextResponse.json({ success: false, error: 'Tiket sudah digunakan', valid: false, data: order }, { status: 200, headers: corsHeaders })
    }
    if (order.status === 'cancelled') {
      return NextResponse.json({ success: false, error: 'Pesanan telah dibatalkan', valid: false, data: order }, { status: 200, headers: corsHeaders })
    }
    if (order.status === 'pending') {
      return NextResponse.json({ success: false, error: 'Tiket belum dibayar', valid: false, data: order }, { status: 200, headers: corsHeaders })
    }

    // Valid (paid/confirmed) -> mark as used
    await query('UPDATE \`Order\` SET status = ? WHERE id = ?', ['used', order.id])
    order.status = 'used'

    return NextResponse.json({ success: true, valid: true, message: 'Tiket berhasil divalidasi', data: order }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Validate error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal validasi tiket' }, { status: 500, headers: corsHeaders })
  }
}
