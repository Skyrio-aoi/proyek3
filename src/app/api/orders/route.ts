import { NextRequest, NextResponse } from 'next/server'
import { getOne, getAll, query } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function generateOrderCode(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const r = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `NPL-${y}${m}${d}-${r}`
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
      // Admin: get all orders with user info
      const orders = await getAll(`
        SELECT o.*, u.name as userName, u.email as userEmail, u.phone as userPhone
        FROM \`Order\` o
        LEFT JOIN User u ON o.userId = u.id
        ORDER BY o.createdAt DESC
      `)
      // Get order items for each order
      for (const order of orders) {
        order.orderItems = await getAll(
          'SELECT oi.*, tt.name as ticketTypeName, tt.price as ticketPrice FROM OrderItem oi LEFT JOIN TicketType tt ON oi.ticketTypeId = tt.id WHERE oi.orderId = ?',
          [order.id]
        )
      }
      return NextResponse.json({ success: true, data: orders }, { status: 200, headers: corsHeaders })
    }

    if (userId) {
      const orders = await getAll('SELECT * FROM \`Order\` WHERE userId = ? ORDER BY createdAt DESC', [userId])
      for (const order of orders) {
        order.orderItems = await getAll(
          'SELECT oi.*, tt.name as ticketTypeName, tt.price as ticketPrice FROM OrderItem oi LEFT JOIN TicketType tt ON oi.ticketTypeId = tt.id WHERE oi.orderId = ?',
          [order.id]
        )
      }
      return NextResponse.json({ success: true, data: orders }, { status: 200, headers: corsHeaders })
    }

    return NextResponse.json({ success: false, error: 'Berikan userId atau action=all' }, { status: 400, headers: corsHeaders })
  } catch (error: any) {
    console.error('Get orders error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data pesanan' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, ticketTypeId, quantity, visitDate, paymentMethod, notes } = body

    if (action !== 'create') {
      return NextResponse.json({ success: false, error: 'Action tidak valid' }, { status: 400, headers: corsHeaders })
    }
    if (!userId || !ticketTypeId || !quantity || !visitDate) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400, headers: corsHeaders })
    }

    const user = await getOne('SELECT id FROM User WHERE id = ?', [userId])
    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }

    const ticketType = await getOne('SELECT * FROM TicketType WHERE id = ?', [ticketTypeId])
    if (!ticketType || !ticketType.isActive) {
      return NextResponse.json({ success: false, error: 'Tipe tiket tidak tersedia' }, { status: 404, headers: corsHeaders })
    }

    const qty = parseInt(quantity, 10)
    const totalAmount = ticketType.price * qty

    // Generate unique order code
    let orderCode = generateOrderCode()
    let exists = await getOne('SELECT id FROM \`Order\` WHERE orderCode = ?', [orderCode])
    while (exists) {
      orderCode = generateOrderCode()
      exists = await getOne('SELECT id FROM \`Order\` WHERE orderCode = ?', [orderCode])
    }

    const orderId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
    const itemId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + 'i'

    await query(
      'INSERT INTO \`Order\` (id, orderCode, userId, totalAmount, status, visitDate, paymentMethod, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, orderCode, userId, totalAmount, 'pending', visitDate, paymentMethod || null, notes || null]
    )

    await query(
      'INSERT INTO OrderItem (id, orderId, ticketTypeId, quantity, unitPrice, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
      [itemId, orderId, ticketTypeId, qty, ticketType.price, totalAmount]
    )

    const order = await getOne('SELECT * FROM \`Order\` WHERE id = ?', [orderId])
    order.orderItems = await getAll(
      'SELECT oi.*, tt.name as ticketTypeName FROM OrderItem oi LEFT JOIN TicketType tt ON oi.ticketTypeId = tt.id WHERE oi.orderId = ?',
      [orderId]
    )

    return NextResponse.json({ success: true, data: order }, { status: 201, headers: corsHeaders })
  } catch (error: any) {
    console.error('Create order error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal membuat pesanan: ' + (error?.message || '') }, { status: 500, headers: corsHeaders })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, orderId, status } = body

    if (action !== 'updateStatus') {
      return NextResponse.json({ success: false, error: 'Action tidak valid' }, { status: 400, headers: corsHeaders })
    }
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'orderId dan status wajib diisi' }, { status: 400, headers: corsHeaders })
    }

    const validStatuses = ['pending', 'paid', 'confirmed', 'cancelled', 'used']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Status tidak valid' }, { status: 400, headers: corsHeaders })
    }

    const existing = await getOne('SELECT id FROM \`Order\` WHERE id = ?', [orderId])
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404, headers: corsHeaders })
    }

    await query('UPDATE \`Order\` SET status = ? WHERE id = ?', [status, orderId])
    const order = await getOne(`
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM \`Order\` o
      LEFT JOIN User u ON o.userId = u.id
      WHERE o.id = ?
    `, [orderId])
    order.orderItems = await getAll(
      'SELECT oi.*, tt.name as ticketTypeName FROM OrderItem oi LEFT JOIN TicketType tt ON oi.ticketTypeId = tt.id WHERE oi.orderId = ?',
      [orderId]
    )

    return NextResponse.json({ success: true, data: order }, { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('Update order error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal mengupdate pesanan' }, { status: 500, headers: corsHeaders })
  }
}
