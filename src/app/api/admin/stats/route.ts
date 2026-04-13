import { NextRequest, NextResponse } from 'next/server'
import { getOne, getAll } from '@/lib/db'

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
    const todayStr = now.toISOString().split('T')[0]

    const totalVisitors = await getOne('SELECT COUNT(*) as c FROM User WHERE role = ?', ['visitor'])
    const totalRevenue = await getOne("SELECT COALESCE(SUM(totalAmount), 0) as c FROM `Order` WHERE status IN ('paid', 'confirmed', 'used')")
    const totalOrders = await getOne('SELECT COUNT(*) as c FROM `Order`')
    const todayVisitors = await getOne("SELECT COUNT(*) as c FROM User WHERE role = 'visitor' AND DATE(createdAt) = ?", [todayStr])
    const todayRevenue = await getOne("SELECT COALESCE(SUM(totalAmount), 0) as c FROM `Order` WHERE status IN ('paid', 'confirmed', 'used') AND DATE(createdAt) = ?", [todayStr])
    const todayOrders = await getOne("SELECT COUNT(*) as c FROM `Order` WHERE DATE(createdAt) = ?", [todayStr])

    const recentOrders = await getAll(`
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM \`Order\` o LEFT JOIN User u ON o.userId = u.id
      ORDER BY o.createdAt DESC LIMIT 10
    `)
    for (const order of recentOrders) {
      order.orderItems = await getAll(
        'SELECT oi.*, tt.name as ticketTypeName, tt.price as ticketPrice, oi.subtotal FROM OrderItem oi LEFT JOIN TicketType tt ON oi.ticketTypeId = tt.id WHERE oi.orderId = ?',
        [order.id]
      )
    }

    // Monthly data
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const monthEnd = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

      const monthRev = await getOne(
        "SELECT COALESCE(SUM(totalAmount), 0) as c FROM `Order` WHERE status IN ('paid', 'confirmed', 'used') AND DATE(createdAt) >= ? AND DATE(createdAt) <= ?",
        [monthStart, monthEnd]
      )
      const monthOrd = await getOne(
        "SELECT COUNT(*) as c FROM `Order` WHERE status IN ('paid', 'confirmed', 'used') AND DATE(createdAt) >= ? AND DATE(createdAt) <= ?",
        [monthStart, monthEnd]
      )
      const monthVis = await getOne(
        "SELECT COUNT(DISTINCT userId) as c FROM `Order` WHERE status IN ('paid', 'confirmed', 'used') AND DATE(createdAt) >= ? AND DATE(createdAt) <= ?",
        [monthStart, monthEnd]
      )

      monthlyData.push({
        month: monthLabel,
        revenue: monthRev?.c || 0,
        orderCount: monthOrd?.c || 0,
        visitorCount: monthVis?.c || 0,
      })
    }

    // Status breakdown
    const statusRows = await getAll("SELECT status, COUNT(*) as count FROM `Order` GROUP BY status")
    const statusBreakdown: Record<string, number> = {}
    for (const row of statusRows) {
      statusBreakdown[row.status] = row.count
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          totalVisitors: totalVisitors?.c || 0,
          totalRevenue: totalRevenue?.c || 0,
          totalOrders: totalOrders?.c || 0,
          todayVisitors: todayVisitors?.c || 0,
          todayRevenue: todayRevenue?.c || 0,
          todayOrders: todayOrders?.c || 0,
          recentOrders,
          monthlyData,
          statusBreakdown,
        },
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('Admin stats error:', error?.message)
    return NextResponse.json({ success: false, error: 'Gagal memuat statistik' }, { status: 500, headers: corsHeaders })
  }
}
