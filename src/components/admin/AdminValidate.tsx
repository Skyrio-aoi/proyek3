'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ScanLine,
  Search,
  Ticket,
  User,
  Calendar,
  Hash,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDateShort } from '@/lib/currency';

interface ValidationData {
  id: string;
  orderCode: string;
  status: string;
  totalAmount: number;
  visitDate: string;
  paymentMethod: string | null;
  updatedAt: string;
  user: { name: string; email: string; phone: string | null };
  orderItems: Array<{
    ticketType: { name: string };
    quantity: number;
    unitPrice: number;
  }>;
}

type ValidationState = 'idle' | 'loading' | 'success' | 'failed' | 'already_used' | 'cancelled' | 'unpaid';

interface RecentValidation {
  orderCode: string;
  visitorName: string;
  ticketType: string;
  result: 'success' | 'already_used' | 'failed';
  timestamp: Date;
}

export default function AdminValidate() {
  const navigate = useAppStore((s) => s.navigate);
  const [orderCode, setOrderCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentValidations, setRecentValidations] = useState<RecentValidation[]>([]);

  async function handleValidate() {
    const code = orderCode.trim().toUpperCase();
    if (!code) {
      toast.error('Masukkan kode pesanan');
      return;
    }

    setValidating(true);
    setValidationState('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: code }),
      });
      const json = await res.json();

      if (json.valid) {
        setValidationState('success');
        setValidationData(json.data);
        toast.success('Tiket berhasil divalidasi');
        const ticketTypes = json.data?.orderItems?.map((i: ValidationData['orderItems'][0]) => i.ticketType?.name).filter(Boolean) || ['Tiket'];
        addRecentValidation(code, json.data?.user?.name || '-', ticketTypes.join(', '), 'success');
      } else {
        const error = json.error || 'Validasi gagal';
        setErrorMessage(error);
        if (json.data?.status === 'used') {
          setValidationState('already_used');
          setValidationData(json.data);
          addRecentValidation(code, json.data?.user?.name || '-', 'Tiket', 'already_used');
        } else if (json.data?.status === 'cancelled') {
          setValidationState('cancelled');
          setValidationData(json.data);
          addRecentValidation(code, '-', '-', 'failed');
        } else if (json.data?.status === 'pending') {
          setValidationState('unpaid');
          setValidationData(json.data);
          addRecentValidation(code, '-', '-', 'failed');
        } else {
          setValidationState('failed');
          addRecentValidation(code, '-', '-', 'failed');
        }
      }
    } catch {
      setValidationState('failed');
      setErrorMessage('Terjadi kesalahan jaringan');
      toast.error('Terjadi kesalahan saat memvalidasi');
    } finally {
      setValidating(false);
    }
  }

  function addRecentValidation(code: string, name: string, ticketType: string, result: RecentValidation['result']) {
    setRecentValidations((prev) => [
      { orderCode: code, visitorName: name, ticketType, result, timestamp: new Date() },
      ...prev.slice(0, 9),
    ]);
  }

  function handleReset() {
    setOrderCode('');
    setValidationState('idle');
    setValidationData(null);
    setErrorMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleValidate();
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('admin-dashboard')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ScanLine className="size-6 text-emerald-600" />
            Validasi Tiket
          </h1>
          <p className="text-sm text-gray-500">Scan QR code atau masukkan kode pesanan manual</p>
        </div>
      </div>

      {/* Scanner Area */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center">
            <div className="mx-auto mb-6 flex size-48 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-white">
              <ScanLine className="size-16 text-emerald-300" />
            </div>
            <p className="mb-1 text-lg font-semibold text-gray-700">Area Scan QR Code</p>
            <p className="text-sm text-gray-500">
              Arahkan QR code tiket ke kamera atau masukkan kode manual di bawah
            </p>
          </div>
          <div className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Masukkan kode pesanan (contoh: NPL-20250712-12345)"
                  className="pl-10 font-mono"
                  disabled={validating}
                />
              </div>
              <Button
                onClick={handleValidate}
                disabled={validating || !orderCode.trim()}
                className="gap-2 bg-emerald-600 px-6 hover:bg-emerald-700"
              >
                {validating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Validasi
              </Button>
            </div>
            {validationState !== 'idle' && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-gray-500">
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationState === 'success' && validationData && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="size-6 text-emerald-600" />
              Tiket Valid
            </CardTitle>
            <CardDescription>Tiket berhasil divalidasi dan digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Pengunjung</p>
                  <p className="font-medium">{validationData.user?.name || '-'}</p>
                  <p className="text-xs text-gray-500">{validationData.user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="mt-0.5 size-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Tipe Tiket</p>
                  <p className="font-medium">
                    {validationData.orderItems?.map((i) => i.ticketType?.name).join(', ') || '-'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {validationData.orderItems?.reduce((s, i) => s + i.quantity, 0)} tiket
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Tanggal Kunjungan</p>
                  <p className="font-medium">
                    {validationData.visitDate ? formatDateShort(validationData.visitDate) : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="mt-0.5 size-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Kode Pesanan</p>
                  <p className="font-mono text-sm font-medium">{validationData.orderCode}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {validationState === 'already_used' && validationData && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="size-6 text-amber-500" />
              Tiket Sudah Digunakan
            </CardTitle>
            <CardDescription>Tiket ini sudah pernah divalidasi sebelumnya</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 size-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Pengunjung</p>
                  <p className="font-medium">{validationData.user?.name || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="mt-0.5 size-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Kode Pesanan</p>
                  <p className="font-mono text-sm font-medium">{validationData.orderCode}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(validationState === 'failed' || validationState === 'cancelled' || validationState === 'unpaid') && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="size-6 text-red-500" />
              {validationState === 'cancelled'
                ? 'Tiket Dibatalkan'
                : validationState === 'unpaid'
                  ? 'Tiket Belum Dibayar'
                  : 'Validasi Gagal'}
            </CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          {validationData && (
            <CardContent>
              <div className="flex items-start gap-3">
                <Hash className="mt-0.5 size-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Kode Pesanan</p>
                  <p className="font-mono text-sm font-medium">{validationData.orderCode}</p>
                  <Badge
                    variant="outline"
                    className={
                      validationState === 'cancelled'
                        ? 'border-red-200 bg-red-100 text-red-700'
                        : 'border-yellow-200 bg-yellow-100 text-yellow-700'
                    }
                  >
                    {validationState === 'cancelled' ? 'Dibatalkan' : 'Menunggu Pembayaran'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {validationState === 'loading' && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 size-10 animate-spin text-emerald-600" />
              <p className="text-gray-500">Memvalidasi tiket...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Validations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Validasi Terbaru</CardTitle>
          <CardDescription>Daftar tiket yang baru saja divalidasi</CardDescription>
        </CardHeader>
        <CardContent>
          {recentValidations.length > 0 ? (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {recentValidations.map((v, idx) => (
                <div
                  key={`${v.orderCode}-${idx}`}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {v.result === 'success' ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : v.result === 'already_used' ? (
                      <AlertTriangle className="size-5 text-amber-500" />
                    ) : (
                      <XCircle className="size-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-mono text-sm font-medium">{v.orderCode}</p>
                      <p className="text-xs text-gray-500">
                        {v.visitorName} - {v.ticketType}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {v.timestamp.toLocaleTimeString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              Belum ada validasi dilakukan
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
