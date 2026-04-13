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

// POST /api/orders/validate - Validate ticket at gate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderCode } = body

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: 'Order code is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const order = await db.order.findUnique({
      where: { orderCode },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found', valid: false },
        { status: 404, headers: corsHeaders }
      )
    }

    // Already used
    if (order.status === 'used') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ticket has already been used',
          valid: false,
          data: {
            orderCode: order.orderCode,
            status: order.status,
            user: order.user,
            orderItems: order.orderItems,
            usedAt: order.updatedAt,
          },
        },
        { status: 200, headers: corsHeaders }
      )
    }

    // Cancelled or pending - cannot be validated
    if (order.status === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ticket has been cancelled',
          valid: false,
          data: {
            orderCode: order.orderCode,
            status: order.status,
          },
        },
        { status: 200, headers: corsHeaders }
      )
    }

    if (order.status === 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ticket has not been paid yet',
          valid: false,
          data: {
            orderCode: order.orderCode,
            status: order.status,
          },
        },
        { status: 200, headers: corsHeaders }
      )
    }

    // Valid ticket (paid or confirmed) - mark as used
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: { status: 'used' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        valid: true,
        message: 'Ticket validated successfully',
        data: updatedOrder,
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Validate order error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate ticket' },
      { status: 500, headers: corsHeaders }
    )
  }
}
