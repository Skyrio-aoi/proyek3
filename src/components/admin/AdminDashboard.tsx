'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  LayoutDashboard,
  MapPin,
  ScanLine,
  ClipboardList,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDateShort } from '@/lib/currency';

interface DashboardStats {
  totalVisitors: number;
  totalRevenue: number;
  totalOrders: number;
  todayVisitors: number;
  todayRevenue: number;
  todayOrders: number;
  recentOrders: Array<{
    id: string;
    orderCode: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    orderCount: number;
    visitorCount: number;
  }>;
  statusBreakdown: Record<string, number>;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  paid: { label: 'Dibayar', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  confirmed: { label: 'Terkonfirmasi', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  used: { label: 'Digunakan', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800 border-red-200' },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-emerald-700">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useAppStore((s) => s.navigate);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        } else {
          toast.error('Gagal memuat data dashboard');
        }
      } catch {
        toast.error('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Kelola Wahana', view: 'admin-rides', icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Validasi Tiket', view: 'admin-validate', icon: ScanLine, color: 'text-teal-600 bg-teal-50' },
    { label: 'Monitor Absensi', view: 'admin-attendance', icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
    { label: 'Lihat Laporan', view: 'admin-reports', icon: BarChart3, color: 'text-rose-600 bg-rose-50' },
  ];

  const statCards = stats
    ? [
        {
          label: 'Total Pengunjung',
          value: stats.totalVisitors.toLocaleString('id-ID'),
          icon: Users,
          color: 'text-emerald-600 bg-emerald-100',
          trend: { value: stats.todayVisitors, label: 'hari ini' },
          trendUp: true,
        },
        {
          label: 'Total Pendapatan',
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          color: 'text-teal-600 bg-teal-100',
          trend: { value: formatCurrency(stats.todayRevenue), label: 'hari ini' },
          trendUp: true,
        },
        {
          label: 'Total Pesanan',
          value: stats.totalOrders.toLocaleString('id-ID'),
          icon: ShoppingCart,
          color: 'text-amber-600 bg-amber-100',
          trend: { value: stats.todayOrders, label: 'hari ini' },
          trendUp: true,
        },
        {
          label: 'Pengunjung Hari Ini',
          value: stats.todayVisitors.toLocaleString('id-ID'),
          icon: Users,
          color: 'text-rose-600 bg-rose-100',
          trend: { value: stats.todayOrders, label: 'pesanan baru' },
          trendUp: true,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-600">
            <LayoutDashboard className="size-5 text-white" />
          </div>
          Admin Dashboard
        </h1>
        <p className="mt-1 text-gray-500">
          Ringkasan data dan statistik NicePlayland
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="gap-4 py-5">
            <CardContent className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{card.value}</p>
                <div className="flex items-center gap-1 text-xs">
                  {card.trendUp ? (
                    <TrendingUp className="size-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="size-3 text-red-500" />
                  )}
                  <span className="text-gray-500">
                    {card.trend.value} {card.trend.label}
                  </span>
                </div>
              </div>
              <div className={`rounded-xl p-3 ${card.color}`}>
                <card.icon className="size-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Pendapatan Bulanan</CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.monthlyData && stats.monthlyData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}jt`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center text-gray-400">
                Belum ada data pendapatan
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            <CardDescription>Navigasi ke halaman admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.view}
                variant="outline"
                className="w-full justify-start gap-3 py-5 text-sm font-medium"
                onClick={() => navigate(action.view)}
              >
                <div className={`rounded-lg p-2 ${action.color}`}>
                  <action.icon className="size-4" />
                </div>
                {action.label}
                <ArrowRight className="ml-auto size-4 text-gray-400" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
          <CardDescription>10 pesanan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Pesanan</TableHead>
                  <TableHead>Pengunjung</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => {
                    const s = statusMap[order.status] || statusMap.pending;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {order.orderCode}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user?.name || '-'}</p>
                            <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateShort(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={s.className}>
                            {s.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                      Belum ada pesanan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
