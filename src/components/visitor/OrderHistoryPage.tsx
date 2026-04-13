'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  Ticket,
  CreditCard,
  ChevronDown,
  History,
  Loader2,
  TrendingUp,
  Receipt,
  Crown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatDate, formatDateShort } from '@/lib/currency'

interface OrderItem {
  id: string
  ticketTypeId: string
  quantity: number
  unitPrice: number
  subtotal: number
  ticketType: {
    id: string
    name: string
    description?: string | null
    price: number
    isActive: boolean
  }
}

interface Order {
  id: string
  orderCode: string
  userId: string
  totalAmount: number
  status: string
  visitDate: string
  paymentMethod?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  paid: {
    label: 'Dibayar',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  confirmed: {
    label: 'Terkonfirmasi',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  used: {
    label: 'Digunakan',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

function getPaymentLabel(method: string | null | undefined): string {
  switch (method) {
    case 'transfer':
      return 'Transfer Bank'
    case 'ewallet':
      return 'E-Wallet'
    case 'onsite':
      return 'Bayar di Lokasi'
    default:
      return method || '-'
  }
}

function OrderRow({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false)
  const status = STATUS_CONFIG[order.status] || {
    label: order.status,
    className: '',
  }
  const ticketType = order.orderItems[0]?.ticketType
  const quantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardContent className="py-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-semibold text-sm truncate">
                        {order.orderCode}
                      </span>
                      <Badge variant="outline" className={status.className + ' shrink-0'}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {ticketType?.name || '-'} - {quantity} tiket - {formatDateShort(order.visitDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="font-bold text-emerald-600 hidden sm:block">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t">
            <CardContent className="py-4 px-5 space-y-4">
              {/* Mobile price */}
              <div className="flex justify-between sm:hidden">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Tipe Tiket</p>
                  <p className="font-medium text-sm flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                    {ticketType?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Jumlah</p>
                  <p className="font-medium text-sm">{quantity} tiket</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Tanggal Kunjungan</p>
                  <p className="font-medium text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {formatDateShort(order.visitDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Metode Pembayaran</p>
                  <p className="font-medium text-sm flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    {getPaymentLabel(order.paymentMethod)}
                  </p>
                </div>
              </div>

              {/* Order items table */}
              {order.orderItems.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                      Detail Item
                    </p>
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs">Tiket</TableHead>
                            <TableHead className="text-xs text-center">Qty</TableHead>
                            <TableHead className="text-xs text-right">Harga</TableHead>
                            <TableHead className="text-xs text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-sm font-medium">
                                {item.ticketType.name}
                              </TableCell>
                              <TableCell className="text-sm text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-sm text-right">
                                {formatCurrency(item.unitPrice)}
                              </TableCell>
                              <TableCell className="text-sm text-right font-medium">
                                {formatCurrency(item.subtotal)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Catatan</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </>
              )}

              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Dibuat: {formatDateShort(order.createdAt)}</span>
                <span>Terakhir diperbarui: {formatDateShort(order.updatedAt)}</span>
              </div>
            </CardContent>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default function OrderHistoryPage() {
  const { user, navigate } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (!user) {
      navigate('auth')
      return
    }

    async function fetchOrders() {
      try {
        const res = await fetch(`/api/orders?userId=${user!.id}`)
        const data = await res.json()
        if (data.success) {
          setOrders(data.data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, navigate])

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus)

  // Summary stats
  const totalOrders = orders.length
  const totalSpending = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  // Most visited ticket type
  const ticketTypeCount: Record<string, number> = {}
  orders
    .filter((o) => o.status === 'used' || o.status === 'confirmed')
    .forEach((o) => {
      o.orderItems.forEach((item) => {
        ticketTypeCount[item.ticketType.name] =
          (ticketTypeCount[item.ticketType.name] || 0) + item.quantity
      })
    })
  const mostVisited = Object.entries(ticketTypeCount).sort((a, b) => b[1] - a[1])[0]

  const statusFilters = [
    { value: 'all', label: 'Semua' },
    { value: 'pending', label: 'Menunggu' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'confirmed', label: 'Terkonfirmasi' },
    { value: 'used', label: 'Digunakan' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('home')}
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 w-4 h-4" />
            Kembali
          </Button>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="ml-3 text-muted-foreground">Memuat riwayat...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('home')}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          Kembali
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Riwayat Pesanan</h1>
          <p className="text-muted-foreground mt-1">
            Lihat semua pesanan tiket Anda
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pesanan</p>
                <p className="text-xl font-bold">{totalOrders}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pengeluaran</p>
                <p className="text-xl font-bold">{formatCurrency(totalSpending)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Favorit</p>
                <p className="text-xl font-bold truncate">
                  {mostVisited ? mostVisited[0] : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <History className="w-4 h-4 text-muted-foreground shrink-0" />
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={filterStatus === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(filter.value)}
              className={
                filterStatus === filter.value
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shrink-0'
                  : 'shrink-0'
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Belum ada pesanan</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {filterStatus !== 'all'
                  ? `Tidak ada pesanan dengan status "${statusFilters.find((f) => f.value === filterStatus)?.label}"`
                  : 'Anda belum memiliki pesanan. Mulai pesan tiket sekarang!'}
              </p>
              <Button
                onClick={() => navigate('booking')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Pesan Tiket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
