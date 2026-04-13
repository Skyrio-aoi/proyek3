'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  CircleCheck,
  CircleX,
  Clock,
  Timer,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  locationName: string | null;
}

interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getDayName(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(dateStr));
}

function formatLiveDateTime(date: Date): { date: string; time: string; day: string } {
  return {
    day: date.toLocaleDateString('id-ID', { weekday: 'long' }),
    date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

function calculateTotalHours(records: AttendanceRecord[]): string {
  let totalMinutes = 0;
  for (const r of records) {
    if (r.checkInTime && r.checkOutTime) {
      const inTime = new Date(r.checkInTime).getTime();
      const outTime = new Date(r.checkOutTime).getTime();
      totalMinutes += (outTime - inTime) / (1000 * 60);
    }
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${hours} jam ${mins} menit`;
}

export default function EmployeeDashboard() {
  const { user, navigate } = useAppStore();
  const { toast } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/attendance?userId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        setAttendanceRecords(json.data);
      }
    } catch {
      toast({ title: 'Gagal memuat data kehadiran', variant: 'destructive' });
    }
  }, [user, toast]);

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/locations');
      const json = await res.json();
      if (json.success) {
        setLocations(json.data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await Promise.all([fetchAttendance(), fetchLocations()]);
      if (!cancelled) setLoading(false);
    };
    init();
    return () => { cancelled = true; };
  }, [fetchAttendance, fetchLocations]);

  // Compute stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthRecords = attendanceRecords.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const todayStr = now.toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find((r) => r.date.split('T')[0] === todayStr);

  const lastCheckIn = todayRecord?.checkInTime
    ? formatTime(todayRecord.checkInTime)
    : monthRecords.length > 0
      ? formatTime(monthRecords[0].checkInTime)
      : '-';

  const totalHours = calculateTotalHours(monthRecords);
  const isPresentToday = !!todayRecord?.checkInTime;
  const statusLabel = todayRecord?.status === 'late' ? 'Terlambat' : isPresentToday ? 'Hadir' : 'Belum Absen';

  const live = formatLiveDateTime(currentTime);

  const primaryLocation = locations[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-8 w-64" />
          <Skeleton className="mb-2 h-5 w-48" />
          <Skeleton className="mb-8 h-4 w-36" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Selamat Datang, {user?.name}
            </h1>
            <Badge className="w-fit bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
              Karyawan
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            {live.day}, {live.date}
          </p>
          <p className="font-mono text-lg font-semibold text-emerald-700 sm:text-xl">
            {live.time}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <Card className="border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <CalendarCheck className="size-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 sm:text-sm">Total Kehadiran</p>
                  <p className="text-xs text-gray-400">Bulan Ini</p>
                  <p className="text-xl font-bold text-gray-900">{monthRecords.length} hari</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${isPresentToday ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {isPresentToday ? (
                    <CircleCheck className="size-5 text-emerald-600" />
                  ) : (
                    <CircleX className="size-5 text-red-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 sm:text-sm">Status Hari Ini</p>
                  <p className={`text-lg font-bold ${isPresentToday ? 'text-emerald-600' : 'text-red-500'}`}>
                    {statusLabel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Clock className="size-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 sm:text-sm">Jam Masuk Terakhir</p>
                  <p className="text-lg font-bold text-gray-900">{lastCheckIn}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                  <Timer className="size-5 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 sm:text-sm">Total Jam Kerja</p>
                  <p className="text-lg font-bold text-gray-900">{totalHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action: Absen Masuk */}
        <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between sm:gap-6">
            <div className="text-center text-white sm:text-left">
              <h2 className="text-lg font-bold sm:text-xl">
                {todayRecord?.checkInTime ? 'Sudah Absen Masuk' : 'Absen Masuk Sekarang'}
              </h2>
              <p className="mt-1 text-sm text-emerald-100">
                {todayRecord?.checkInTime
                  ? `Anda telah masuk pada pukul ${formatTime(todayRecord.checkInTime)}`
                  : 'Jangan lupa untuk melakukan absensi kehadiran hari ini'}
              </p>
            </div>
            {!todayRecord?.checkInTime && (
              <Button
                size="lg"
                className="bg-white font-semibold text-emerald-700 shadow-md hover:bg-emerald-50"
                onClick={() => navigate('employee-attendance')}
              >
                Absen Masuk
                <ArrowRight className="ml-2 size-4" />
              </Button>
            )}
            {todayRecord?.checkInTime && !todayRecord?.checkOutTime && (
              <Button
                size="lg"
                className="bg-amber-500 font-semibold text-white shadow-md hover:bg-amber-600"
                onClick={() => navigate('employee-attendance')}
              >
                Absen Keluar
                <ArrowRight className="ml-2 size-4" />
              </Button>
            )}
            {todayRecord?.checkInTime && todayRecord?.checkOutTime && (
              <Badge className="border-0 bg-white/20 px-3 py-1 text-sm text-white">
                Selesai - {formatTime(todayRecord.checkOutTime)}
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Attendance History */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarCheck className="size-5 text-emerald-600" />
                  Riwayat Kehadiran
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {monthRecords.length} bulan ini
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {monthRecords.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <AlertCircle className="size-10 text-gray-300" />
                  <p className="text-sm text-gray-500">Belum ada riwayat kehadiran bulan ini</p>
                </div>
              ) : (
                <div className="max-h-96 divide-y overflow-y-auto">
                  {monthRecords.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getDayName(record.date)}, {formatDateShort(record.date)}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Masuk: {formatTime(record.checkInTime)} | Keluar: {formatTime(record.checkOutTime)}
                        </p>
                        {record.locationName && (
                          <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="size-3" />
                            {record.locationName}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={
                          record.status === 'present'
                            ? 'border-0 bg-emerald-100 text-emerald-700'
                            : record.status === 'late'
                              ? 'border-0 bg-amber-100 text-amber-700'
                              : 'border-0 bg-gray-100 text-gray-600'
                        }
                      >
                        {record.status === 'present' ? 'Hadir' : record.status === 'late' ? 'Terlambat' : record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="size-5 text-emerald-600" />
                Jadwal & Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-800">Jam Kerja</p>
                <p className="mt-1 text-sm text-emerald-700">08:00 - 17:00 WIB</p>
                <p className="text-xs text-emerald-600">Senin - Sabtu</p>
              </div>

              {primaryLocation && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-700">Lokasi Kantor</p>
                  <p className="mt-1 text-sm text-gray-600">{primaryLocation.name}</p>
                  <p className="text-xs text-gray-500">
                    {primaryLocation.latitude}, {primaryLocation.longitude}
                  </p>
                  <p className="text-xs text-gray-500">Radius: {primaryLocation.radius} meter</p>
                </div>
              )}

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700">Kontak Admin</p>
                <p className="mt-1 text-sm text-gray-600">admin@niceplayland.com</p>
                <p className="text-xs text-gray-500">+62 812 3456 7890</p>
              </div>

              <Button
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={() => navigate('employee-schedule')}
              >
                Lihat Jadwal Lengkap
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
