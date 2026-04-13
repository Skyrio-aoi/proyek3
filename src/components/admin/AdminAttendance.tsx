'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CalendarCheck,
  Users,
  Clock,
  AlertCircle,
  MapPin,
  Loader2,
  Navigation,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/store/useAppStore';
import { formatDateShort } from '@/lib/currency';

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  user: { id: string; name: string; email: string; role: string };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  present: { label: 'Hadir', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  late: { label: 'Terlambat', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  absent: { label: 'Tidak Hadir', className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function AdminAttendance() {
  const navigate = useAppStore((s) => s.navigate);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch('/api/attendance?action=all');
        const json = await res.json();
        if (json.success) {
          setRecords(json.data);
        } else {
          toast.error('Gagal memuat data kehadiran');
        }
      } catch {
        toast.error('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = useMemo(() => {
    const targetDate = dateFilter || todayStr;
    return records.filter((r) => {
      const recordDate = new Date(r.date).toISOString().split('T')[0];
      return recordDate === targetDate;
    });
  }, [records, dateFilter, todayStr]);

  const todayStats = useMemo(() => {
    const present = todayRecords.filter((r) => r.status === 'present').length;
    const late = todayRecords.filter((r) => r.status === 'late').length;
    const absent = todayRecords.filter((r) => r.status === 'absent').length;
    return { present, late, absent, total: todayRecords.length };
  }, [todayRecords]);

  const filteredRecords = useMemo(() => {
    if (!dateFilter) return records;
    const target = dateFilter;
    return records.filter((r) => {
      const recordDate = new Date(r.date).toISOString().split('T')[0];
      return recordDate === target;
    });
  }, [records, dateFilter]);

  function formatTime(time: string | null): string {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('admin-dashboard')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <CalendarCheck className="size-6 text-emerald-600" />
              Monitor Kehadiran
            </h1>
            <p className="text-sm text-gray-500">Data kehadiran karyawan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />
          {dateFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateFilter('')}
              className="text-gray-500"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-4 py-5">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100">
              <Users className="size-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.present}</p>
              <p className="text-xs text-gray-400">
                dari {todayStats.total} karyawan
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="gap-4 py-5">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-100">
              <Clock className="size-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Terlambat</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.late}</p>
              <p className="text-xs text-gray-400">
                {todayStats.total > 0
                  ? `${Math.round((todayStats.late / todayStats.total) * 100)}% dari total`
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="gap-4 py-5">
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-red-100">
              <AlertCircle className="size-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tidak Hadir</p>
              <p className="text-2xl font-bold text-gray-900">{todayStats.absent}</p>
              <p className="text-xs text-gray-400">
                {todayStats.total > 0
                  ? `${Math.round((todayStats.absent / todayStats.total) * 100)}% dari total`
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Kehadiran</CardTitle>
            <CardDescription>
              {dateFilter ? `Menampilkan: ${formatDateShort(dateFilter)}` : 'Semua data kehadiran'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jam Masuk</TableHead>
                    <TableHead>Jam Keluar</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                      const sc = statusConfig[record.status] || statusConfig.absent;
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{record.user?.name || '-'}</p>
                              <p className="text-xs text-gray-500">{record.user?.email || ''}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDateShort(record.date)}
                          </TableCell>
                          <TableCell className="text-sm">{formatTime(record.checkInTime)}</TableCell>
                          <TableCell className="text-sm">{formatTime(record.checkOutTime)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {record.locationName || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={sc.className}>
                              {sc.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-400">
                        Tidak ada data kehadiran
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Location Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="size-5 text-emerald-600" />
              Lokasi Absensi
            </CardTitle>
            <CardDescription>Titik lokasi absensi karyawan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">
                <Navigation className="mx-auto mb-2 size-10 text-gray-300" />
                <p className="text-sm text-gray-400">Peta Lokasi</p>
              </div>
            </div>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Lokasi Kantor</p>
                <p className="text-sm font-medium text-gray-700">NicePlayland Office</p>
                <p className="text-xs text-gray-500">Jl. Raya Indramayu, Kabupaten Indramayu, Jawa Barat</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-white p-2">
                  <p className="text-xs text-gray-400">Latitude</p>
                  <p className="text-sm font-mono font-medium">-6.3428</p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <p className="text-xs text-gray-400">Longitude</p>
                  <p className="text-sm font-mono font-medium">108.3384</p>
                </div>
              </div>
              <div className="rounded-md bg-white p-2">
                <p className="text-xs text-gray-400">Radius Validasi</p>
                <p className="text-sm font-medium">10 meter dari titik lokasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
