import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function generateOrderCode(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `NPL-${year}${month}${day}-${random}`
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET /api/orders?userId=xxx or /api/orders?action=all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')

    // Admin: get all orders
    if (action === 'all') {
      const orders = await db.order.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          orderItems: {
            include: {
              ticketType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(
        { success: true, data: orders },
        { status: 200, headers: corsHeaders }
      )
    }

    // Get user's orders
    if (userId) {
      const orders = await db.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              ticketType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(
        { success: true, data: orders },
        { status: 200, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Provide userId or action=all' },
      { status: 400, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, ticketTypeId, quantity, visitDate, paymentMethod, notes } = body

    if (action !== 'create') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "create".' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!userId || !ticketTypeId || !quantity || !visitDate) {
      return NextResponse.json(
        { success: false, error: 'userId, ticketTypeId, quantity, and visitDate are required' },
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

    // Verify ticket type exists and is active
    const ticketType = await db.ticketType.findUnique({ where: { id: ticketTypeId } })
    if (!ticketType) {
      return NextResponse.json(
        { success: false, error: 'Ticket type not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    if (!ticketType.isActive) {
      return NextResponse.json(
        { success: false, error: 'Ticket type is not available' },
        { status: 400, headers: corsHeaders }
      )
    }

    const qty = parseInt(quantity, 10)
    const subtotal = ticketType.price * qty

    // Generate unique order code
    let orderCode = generateOrderCode()
    let codeExists = await db.order.findUnique({ where: { orderCode } })
    while (codeExists) {
      orderCode = generateOrderCode()
      codeExists = await db.order.findUnique({ where: { orderCode } })
    }

    // Create order with order item in a transaction
    const order = await db.order.create({
      data: {
        orderCode,
        userId,
        totalAmount: subtotal,
        status: 'pending',
        visitDate: new Date(visitDate),
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        orderItems: {
          create: {
            ticketTypeId,
            quantity: qty,
            unitPrice: ticketType.price,
            subtotal,
          },
        },
      },
      include: {
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, data: order },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// PUT /api/orders - Update order status (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, orderId, status } = body

    if (action !== 'updateStatus') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "updateStatus".' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'orderId and status are required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const validStatuses = ['pending', 'paid', 'confirmed', 'cancelled', 'used']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400, headers: corsHeaders }
      )
    }

    const existing = await db.order.findUnique({ where: { id: orderId } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    const order = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, data: order },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500, headers: corsHeaders }
    )
  }
}
