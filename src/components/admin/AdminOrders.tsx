'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  CheckCircle,
  XCircle,
  Ticket,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDateShort } from '@/lib/currency';

interface OrderItem {
  id: string;
  ticketType: { id: string; name: string; price: number };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  visitDate: string;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; phone: string | null };
  orderItems: OrderItem[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  paid: { label: 'Dibayar', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  confirmed: { label: 'Terkonfirmasi', className: 'bg-teal-100 text-teal-800 border-teal-200' },
  used: { label: 'Digunakan', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800 border-red-200' },
};

const filterOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'confirmed', label: 'Terkonfirmasi' },
  { value: 'used', label: 'Digunakan' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function AdminOrders() {
  const navigate = useAppStore((s) => s.navigate);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string;
    orderCode: string;
    action: string;
    newStatus: string;
    description: string;
  }>({ open: false, orderId: '', orderCode: '', action: '', newStatus: '', description: '' });
  const [updating, setUpdating] = useState(false);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders?action=all');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        toast.error('Gagal memuat data pesanan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function requestStatusUpdate(order: Order, newStatus: string) {
    const actionLabels: Record<string, string> = {
      paid: 'Konfirmasi Pembayaran',
      confirmed: 'Konfirmasi Tiket',
      used: 'Tandai Digunakan',
      cancelled: 'Batalkan Pesanan',
    };
    const descriptions: Record<string, string> = {
      paid: `Pesanan ${order.orderCode} akan ditandai sebagai "Dibayar". Lanjutkan?`,
      confirmed: `Pesanan ${order.orderCode} akan dikonfirmasi. Pengunjung dapat menggunakan tiket ini.`,
      used: `Pesanan ${order.orderCode} akan ditandai sebagai "Digunakan".`,
      cancelled: `Pesanan ${order.orderCode} akan dibatalkan. Tindakan ini tidak dapat dibatalkan.`,
    };
    setConfirmDialog({
      open: true,
      orderId: order.id,
      orderCode: order.orderCode,
      action: actionLabels[newStatus] || 'Update Status',
      newStatus,
      description: descriptions[newStatus] || '',
    });
  }

  async function confirmStatusUpdate() {
    setUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          orderId: confirmDialog.orderId,
          status: confirmDialog.newStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Pesanan berhasil diperbarui`);
        setConfirmDialog({ ...confirmDialog, open: false });
        fetchOrders();
      } else {
        toast.error(json.error || 'Gagal memperbarui status');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memperbarui status');
    } finally {
      setUpdating(false);
    }
  }

  function getActionButtons(order: Order) {
    const buttons: Array<{ label: string; status: string; variant: 'default' | 'outline' | 'destructive' }> = [];
    if (order.status === 'pending') {
      buttons.push({ label: 'Konfirmasi Pembayaran', status: 'paid', variant: 'default' });
    }
    if (order.status === 'paid') {
      buttons.push({ label: 'Konfirmasi Tiket', status: 'confirmed', variant: 'default' });
      buttons.push({ label: 'Batalkan', status: 'cancelled', variant: 'destructive' });
    }
    if (order.status === 'confirmed') {
      buttons.push({ label: 'Tandai Digunakan', status: 'used', variant: 'outline' });
    }
    return buttons;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('admin-dashboard')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ClipboardList className="size-6 text-emerald-600" />
            Kelola Pesanan
          </h1>
          <p className="text-sm text-gray-500">{orders.length} pesanan total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={activeFilter === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(opt.value)}
              className={
                activeFilter === opt.value
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : ''
              }
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari kode atau nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Pengunjung</TableHead>
                  <TableHead>Tiket</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tanggal Kunjungan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const sc = statusConfig[order.status] || statusConfig.pending;
                    const actions = getActionButtons(order);
                    const totalQty = order.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0;
                    const ticketNames =
                      order.orderItems?.map((i) => i.ticketType?.name).filter(Boolean) || [];
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {order.orderCode}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{order.user?.name || '-'}</p>
                            <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="flex items-center gap-1 text-sm">
                            <Ticket className="size-3.5 shrink-0 text-gray-400" />
                            <span className="truncate">{ticketNames.join(', ') || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{totalQty}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {order.visitDate ? formatDateShort(order.visitDate) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sc.className}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {actions.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              {actions.map((btn) => (
                                <Button
                                  key={btn.status}
                                  variant={btn.variant === 'destructive' ? 'outline' : 'outline'}
                                  size="sm"
                                  className={
                                    btn.variant === 'destructive'
                                      ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                                      : btn.variant === 'default'
                                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                        : ''
                                  }
                                  onClick={() => requestStatusUpdate(order, btn.status)}
                                >
                                  {btn.label}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-gray-400">
                      Tidak ada pesanan ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Status Update Confirmation */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.newStatus === 'cancelled' ? (
                <XCircle className="size-5 text-red-500" />
              ) : (
                <CheckCircle className="size-5 text-emerald-500" />
              )}
              {confirmDialog.action}
            </AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusUpdate}
              disabled={updating}
              className={
                confirmDialog.newStatus === 'cancelled'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }
            >
              {updating && <Loader2 className="mr-2 size-4 animate-spin" />}
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
