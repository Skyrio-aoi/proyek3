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

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const totalVisitors = await db.user.count({
      where: { role: 'visitor' },
    })

    const revenueAgg = await db.order.aggregate({
      where: { status: { in: ['paid', 'confirmed', 'used'] } },
      _sum: { totalAmount: true },
    })
    const totalRevenue = revenueAgg._sum.totalAmount || 0

    const totalOrders = await db.order.count()

    const todayVisitors = await db.user.count({
      where: { role: 'visitor', createdAt: { gte: todayStart } },
    })

    const todayRevenueAgg = await db.order.aggregate({
      where: { status: { in: ['paid', 'confirmed', 'used'] }, createdAt: { gte: todayStart } },
      _sum: { totalAmount: true },
    })
    const todayRevenue = todayRevenueAgg._sum.totalAmount || 0

    const todayOrders = await db.order.count({
      where: { createdAt: { gte: todayStart } },
    })

    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: { ticketType: { select: { name: true } } },
        },
      },
    })

    const monthlyData: Array<{ month: string; revenue: number; orderCount: number; visitorCount: number }> = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      const monthLabel = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })

      const monthOrders = await db.order.findMany({
        where: {
          createdAt: { gte: monthDate, lte: monthEnd },
          status: { in: ['paid', 'confirmed', 'used'] },
        },
        select: { totalAmount: true, userId: true },
      })

      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      const uniqueVisitorIds = new Set(monthOrders.map(o => o.userId))

      monthlyData.push({
        month: monthLabel,
        revenue: monthRevenue,
        orderCount: monthOrders.length,
        visitorCount: uniqueVisitorIds.size,
      })
    }

    const ordersByStatus = await db.order.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const statusBreakdown: Record<string, number> = {}
    for (const item of ordersByStatus) {
      statusBreakdown[item.status] = item._count.id
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          totalVisitors,
          totalRevenue,
          totalOrders,
          todayVisitors,
          todayRevenue,
          todayOrders,
          recentOrders,
          monthlyData,
          statusBreakdown,
        },
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500, headers: corsHeaders }
    )
  }
}
