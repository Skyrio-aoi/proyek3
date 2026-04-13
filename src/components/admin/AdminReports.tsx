'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Calculator,
  TrendingUp,
  Loader2,
  Calendar,
  Users,
  Ticket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
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

interface StatsData {
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
    user: { name: string };
    orderItems: Array<{ ticketType: { name: string }; quantity: number; unitPrice: number; subtotal: number }>;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    orderCount: number;
    visitorCount: number;
  }>;
  statusBreakdown: Record<string, number>;
}

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-emerald-700">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function VisitorTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-teal-700">{payload[0].value} pengunjung</p>
    </div>
  );
}

export default function AdminReports() {
  const navigate = useAppStore((s) => s.navigate);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function fetchStats() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const query = params.toString();
      const url = `/api/admin/stats${query ? `?${query}` : ''}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      } else {
        toast.error('Gagal memuat data laporan');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const summaryCards = useMemo(() => {
    if (!stats) return [];
    const totalOrders = stats.totalOrders || 0;
    const avgOrder = totalOrders > 0 ? stats.totalRevenue / totalOrders : 0;

    const ticketCounts: Record<string, number> = {};
    for (const order of stats.recentOrders || []) {
      for (const item of order.orderItems || []) {
        const name = item.ticketType?.name || 'Lainnya';
        ticketCounts[name] = (ticketCounts[name] || 0) + item.quantity;
      }
    }
    const topTicket = Object.entries(ticketCounts).sort((a, b) => b[1] - a[1])[0];

    return [
      {
        label: 'Total Pendapatan',
        value: formatCurrency(stats.totalRevenue),
        icon: DollarSign,
        color: 'text-emerald-600 bg-emerald-100',
      },
      {
        label: 'Total Pesanan',
        value: totalOrders.toLocaleString('id-ID'),
        icon: ShoppingCart,
        color: 'text-teal-600 bg-teal-100',
      },
      {
        label: 'Rata-rata per Pesanan',
        value: formatCurrency(Math.round(avgOrder)),
        icon: Calculator,
        color: 'text-amber-600 bg-amber-100',
      },
      {
        label: 'Tiket Terlaris',
        value: topTicket ? `${topTicket[0]} (${topTicket[1]})` : '-',
        icon: Ticket,
        color: 'text-rose-600 bg-rose-100',
      },
    ];
  }, [stats]);

  const topTickets = useMemo(() => {
    if (!stats) return [];
    const ticketCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of stats.recentOrders || []) {
      if (order.status === 'cancelled') continue;
      for (const item of order.orderItems || []) {
        const name = item.ticketType?.name || 'Lainnya';
        if (!ticketCounts[name]) {
          ticketCounts[name] = { name, count: 0, revenue: 0 };
        }
        ticketCounts[name].count += item.quantity;
        ticketCounts[name].revenue += item.subtotal || 0;
      }
    }
    return Object.values(ticketCounts).sort((a, b) => b.count - a.count);
  }, [stats]);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('admin-dashboard')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <BarChart3 className="size-6 text-emerald-600" />
              Laporan
            </h1>
            <p className="text-sm text-gray-500">Statistik dan analisis data NicePlayland</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-400" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
              placeholder="Dari"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
              placeholder="Sampai"
            />
          </div>
          <Button onClick={fetchStats} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Terapkan
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="gap-4 py-5">
            <CardContent className="flex items-center gap-4">
              <div className={`flex size-12 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="truncate text-lg font-bold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="size-5 text-emerald-600" />
              Tren Pendapatan
            </CardTitle>
            <CardDescription>Pendapatan per bulan (6 bulan terakhir)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.monthlyData && stats.monthlyData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                      tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}jt`}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ fill: '#059669', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-400">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visitor Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-teal-600" />
              Jumlah Pengunjung
            </CardTitle>
            <CardDescription>Pengunjung unik per bulan (6 bulan terakhir)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.monthlyData && stats.monthlyData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip content={<VisitorTooltip />} />
                    <Bar dataKey="visitorCount" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-400">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiket Terlaris</CardTitle>
            <CardDescription>Berdasarkan jumlah penjualan</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe Tiket</TableHead>
                  <TableHead className="text-center">Terjual</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTickets.length > 0 ? (
                  topTickets.map((ticket, idx) => (
                    <TableRow key={ticket.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{ticket.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{ticket.count}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(ticket.revenue)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-gray-400">
                      Belum ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Pesanan</CardTitle>
            <CardDescription>Distribusi status pesanan</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-right">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.statusBreakdown ? (
                  (() => {
                    const entries = Object.entries(stats.statusBreakdown);
                    const total = entries.reduce((s, [, v]) => s + v, 0);
                    if (entries.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={3} className="py-8 text-center text-gray-400">
                            Belum ada data
                          </TableCell>
                        </TableRow>
                      );
                    }
                    const labels: Record<string, string> = {
                      pending: 'Menunggu',
                      paid: 'Dibayar',
                      confirmed: 'Terkonfirmasi',
                      used: 'Digunakan',
                      cancelled: 'Dibatalkan',
                    };
                    const colors: Record<string, string> = {
                      pending: 'bg-yellow-400',
                      paid: 'bg-emerald-400',
                      confirmed: 'bg-teal-400',
                      used: 'bg-slate-400',
                      cancelled: 'bg-red-400',
                    };
                    return entries.map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`size-3 rounded-full ${colors[status] || 'bg-gray-400'}`} />
                            <span className="font-medium">{labels[status] || status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{count}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full ${colors[status] || 'bg-gray-400'}`}
                                style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                  })()
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-gray-400">
                      Belum ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
