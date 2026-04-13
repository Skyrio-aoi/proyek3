'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Ticket, QrCode, Calendar, Loader2, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { formatDate } from '@/lib/currency'

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

function TicketCard({ order }: { order: Order }) {
  const ticketType = order.orderItems[0]?.ticketType
  const quantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(true)

  useEffect(() => {
    async function generateQR() {
      try {
        const QRCode = (await import('qrcode')).default
        const url = await QRCode.toDataURL(order.orderCode, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })
        setQrDataUrl(url)
      } catch {
        // QR generation failed
      } finally {
        setQrLoading(false)
      }
    }
    generateQR()
  }, [order.orderCode])

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    paid: {
      label: 'Menunggu Konfirmasi',
      variant: 'secondary',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    confirmed: {
      label: 'Terkonfirmasi',
      variant: 'default',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  }

  const status = statusConfig[order.status] || {
    label: order.status,
    variant: 'secondary' as const,
    className: '',
  }

  return (
    <div className="relative">
      {/* Ticket card with tear perforation */}
      <Card className="overflow-hidden border-2">
        {/* Top section - ticket info */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Kode Tiket</p>
              <p className="text-2xl font-bold font-mono tracking-wider">{order.orderCode}</p>
            </div>
            <Badge variant={status.variant} className={status.className}>
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tipe Tiket</p>
              <p className="font-semibold flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-600" />
                {ticketType?.name || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tanggal Kunjungan</p>
              <p className="font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {formatDate(order.visitDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Jumlah</p>
              <p className="font-semibold">{quantity} orang</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Metode Pembayaran</p>
              <p className="font-semibold capitalize">
                {order.paymentMethod === 'transfer'
                  ? 'Transfer Bank'
                  : order.paymentMethod === 'ewallet'
                    ? 'E-Wallet'
                    : order.paymentMethod === 'onsite'
                      ? 'Bayar di Lokasi'
                      : order.paymentMethod || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Perforated separator */}
        <div className="relative flex items-center mx-6">
          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background" />
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background" />
        </div>

        {/* Bottom section - QR code */}
        <div className="p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Tunjukkan QR code ini di gerbang</span>
          </div>
          <div className="border-2 border-muted rounded-lg p-3 bg-white">
            {qrLoading ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code untuk ${order.orderCode}`}
                className="w-[200px] h-[200px]"
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                QR gagal dimuat
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function EmptyState({ onBook }: { onBook: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Ticket className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Belum ada tiket aktif</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Anda belum memiliki tiket aktif. Pesan tiket sekarang untuk menikmati pengalaman seru di NicePlayland.
        </p>
        <Button onClick={onBook} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <ShoppingBag className="mr-2 w-4 h-4" />
          Pesan Tiket
        </Button>
      </CardContent>
    </Card>
  )
}

export default function MyTicketsPage() {
  const { user, navigate } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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

  const activeOrders = orders.filter(
    (order) => order.status === 'paid' || order.status === 'confirmed'
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
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
            <span className="ml-3 text-muted-foreground">Memuat tiket...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
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
          <h1 className="text-3xl font-bold tracking-tight">Tiket Saya</h1>
          <p className="text-muted-foreground mt-1">
            {activeOrders.length > 0
              ? `Anda memiliki ${activeOrders.length} tiket aktif`
              : 'Pesan tiket untuk mulai berpetualang'}
          </p>
        </div>

        {activeOrders.length === 0 ? (
          <EmptyState onBook={() => navigate('booking')} />
        ) : (
          <div className="space-y-6">
            {activeOrders.map((order) => (
              <TicketCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
