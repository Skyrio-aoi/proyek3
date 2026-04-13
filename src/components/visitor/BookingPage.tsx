'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  Ticket,
  Loader2,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/useAppStore'
import { formatCurrency, formatDate } from '@/lib/currency'

const STEPS = [
  { id: 1, label: 'Pilih Tiket' },
  { id: 2, label: 'Detail Pesanan' },
  { id: 3, label: 'Pembayaran' },
]

const TICKET_FEATURES: Record<string, string[]> = {
  'Reguler': ['Akses semua wahana keluarga', 'Termasuk area kids zone', 'Gratis parkir'],
  'Express': ['Semua hak Reguler', 'Akses fast track wahana', 'Diskon F&B 10%', 'Welcome drink'],
  'VIP': ['Semua hak Express', 'Lounge eksklusif', 'Priority all rides', 'F&B voucher Rp 100.000', 'Souvenir spesial'],
  'Annual Pass': ['Unlimited kunjungan 1 tahun', 'Diskon F&B 20%', 'Early access event', 'Guest pass 2x/tahun'],
}

function getTicketIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('express')) return Zap
  if (lower.includes('vip')) return Star
  if (lower.includes('annual')) return Sparkles
  return Ticket
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isActive = step.id <= currentStep
          const isCurrent = step.id === currentStep
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
              >
                {isActive && step.id < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium hidden sm:block ${
                  isActive ? 'text-emerald-600' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepSelectTicket({
  ticketTypes,
  loading,
}: {
  ticketTypes: Record<string, unknown>[]
  loading: boolean
}) {
  const { selectedTicketType, setSelectedTicketType, setBookingStep } = useAppStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-muted-foreground">Memuat tiket...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pilih Tipe Tiket</h2>
        <p className="text-muted-foreground mt-1">
          Pilih tiket yang sesuai dengan kebutuhan kunjungan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ticketTypes.map((ticket) => {
          const ticketData = ticket as {
            id: string
            name: string
            description?: string | null
            price: number
            isActive: boolean
          }
          const IconComp = getTicketIcon(ticketData.name)
          const isSelected = selectedTicketType?.id === ticketData.id
          const features = TICKET_FEATURES[ticketData.name] || []

          return (
            <Card
              key={ticketData.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'border-2 border-transparent hover:border-emerald-200'
              }`}
              onClick={() => setSelectedTicketType(ticket)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{ticketData.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {ticketData.description || 'Tiket masuk NicePlayland'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(ticketData.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">/orang</span>
                </div>
                {features.length > 0 && (
                  <ul className="space-y-1.5">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          disabled={!selectedTicketType}
          onClick={() => setBookingStep(2)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
        >
          Lanjutkan
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function StepBookingDetails() {
  const {
    selectedTicketType,
    bookingQuantity,
    bookingDate,
    setBookingQuantity,
    setBookingDate,
    setBookingStep,
  } = useAppStore()

  if (!selectedTicketType) return null

  const ticketData = selectedTicketType as {
    id: string
    name: string
    price: number
  }
  const subtotal = ticketData.price * bookingQuantity
  const parsedDate = bookingDate ? new Date(bookingDate) : undefined

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Detail Pesanan</h2>
        <p className="text-muted-foreground mt-1">
          Tentukan jumlah tiket dan tanggal kunjungan
        </p>
      </div>

      {/* Selected ticket summary */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{ticketData.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(ticketData.price)} /orang
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBookingStep(1)}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Ubah
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Quantity */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Jumlah Pengunjung
          </Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBookingQuantity(Math.max(1, bookingQuantity - 1))}
              disabled={bookingQuantity <= 1}
              className="h-10 w-10"
            >
              -
            </Button>
            <Input
              type="number"
              min={1}
              max={20}
              value={bookingQuantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                if (val >= 1 && val <= 20) setBookingQuantity(val)
              }}
              className="h-10 w-20 text-center text-lg font-semibold"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBookingQuantity(Math.min(20, bookingQuantity + 1))}
              disabled={bookingQuantity >= 20}
              className="h-10 w-10"
            >
              +
            </Button>
            <span className="text-sm text-muted-foreground">orang</span>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Tanggal Kunjungan
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {parsedDate ? (
                  formatDate(parsedDate)
                ) : (
                  <span className="text-muted-foreground">Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parsedDate}
                onSelect={(date) => setBookingDate(date ? date.toISOString() : '')}
                disabled={(date) => date < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Subtotal */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">Subtotal</span>
              <Badge variant="secondary" className="ml-1">
                {bookingQuantity} x {formatCurrency(ticketData.price)}
              </Badge>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setBookingStep(1)}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Kembali
        </Button>
        <Button
          size="lg"
          disabled={!bookingDate}
          onClick={() => setBookingStep(3)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
        >
          Lanjutkan
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function StepConfirmPay() {
  const {
    selectedTicketType,
    bookingQuantity,
    bookingDate,
    setBookingStep,
    resetBooking,
    navigate,
    user,
  } = useAppStore()

  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState('transfer')
  const [notes, setNotes] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!selectedTicketType || !bookingDate) return null

  const ticketData = selectedTicketType as {
    id: string
    name: string
    price: number
  }
  const total = ticketData.price * bookingQuantity

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Gagal',
        description: 'Silakan login terlebih dahulu',
        variant: 'destructive',
      })
      navigate('auth')
      return
    }

    if (!termsAccepted) {
      toast({
        title: 'Gagal',
        description: 'Anda harus menyetujui syarat dan ketentuan',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: user.id,
          ticketTypeId: ticketData.id,
          quantity: bookingQuantity,
          visitDate: bookingDate,
          paymentMethod,
          notes: notes || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Pesanan Berhasil',
          description: `Pesanan ${data.data.orderCode} telah dibuat. Silakan lakukan pembayaran.`,
        })
        resetBooking()
        navigate('my-tickets')
      } else {
        toast({
          title: 'Gagal',
          description: data.error || 'Terjadi kesalahan saat membuat pesanan',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan koneksi',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Konfirmasi & Pembayaran</h2>
        <p className="text-muted-foreground mt-1">
          Periksa kembali pesanan Anda sebelum membayar
        </p>
      </div>

      {/* Order summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tipe Tiket</span>
              <span className="font-medium">{ticketData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="font-medium">{bookingQuantity} orang</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tanggal Kunjungan</span>
              <span className="font-medium">{formatDate(bookingDate)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Transfer Bank</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  BCA, BNI, Mandiri, BRI
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="ewallet" id="ewallet" />
              <Label htmlFor="ewallet" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">E-Wallet</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  GoPay, OVO, DANA, ShopeePay
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="onsite" id="onsite" />
              <Label htmlFor="onsite" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Bayar di Lokasi</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bayar langsung di kasir NicePlayland
                </p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          placeholder="Tambahkan catatan untuk pesanan Anda..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
          Saya menyetujui{' '}
          <span className="text-emerald-600 font-medium">Syarat & Ketentuan</span> serta{' '}
          <span className="text-emerald-600 font-medium">Kebijakan Privasi</span> NicePlayland
        </Label>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setBookingStep(2)}
          disabled={submitting}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Kembali
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!termsAccepted || submitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 min-w-[180px]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Bayar Sekarang
              <CreditCard className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function BookingPage() {
  const { bookingStep, isAuthenticated, navigate } = useAppStore()
  const [ticketTypes, setTicketTypes] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('auth')
      return
    }

    async function fetchTickets() {
      try {
        const res = await fetch('/api/tickets')
        const data = await res.json()
        if (data.success) {
          setTicketTypes(data.data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('home')}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          Kembali
        </Button>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Pesan Tiket</h1>
        <p className="text-muted-foreground mb-8">Langkah mudah untuk mendapatkan tiket NicePlayland</p>

        <ProgressIndicator currentStep={bookingStep} />

        {bookingStep === 1 && <StepSelectTicket ticketTypes={ticketTypes} loading={loading} />}
        {bookingStep === 2 && <StepBookingDetails />}
        {bookingStep === 3 && <StepConfirmPay />}
      </div>
    </div>
  )
}
