'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Clock,
  CalendarCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';

interface GpsPosition {
  latitude: number;
  longitude: number;
}

interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  locationName: string | null;
}

/**
 * Haversine formula to calculate distance between two GPS coordinates in meters
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'present':
      return <Badge className="border-0 bg-emerald-100 text-emerald-700">Hadir</Badge>;
    case 'late':
      return <Badge className="border-0 bg-amber-100 text-amber-700">Terlambat</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function EmployeeAttendance() {
  const { user, navigate } = useAppStore();
  const { toast } = useToast();

  const [gpsPosition, setGpsPosition] = useState<GpsPosition | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [nearestLocation, setNearestLocation] = useState<LocationData | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Default office location fallback
  const DEFAULT_LAT = -6.3288;
  const DEFAULT_LON = 108.3277;
  const DEFAULT_RADIUS = 10;

  // Fetch office locations
  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/locations');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setLocations(json.data);
        return json.data;
      }
    } catch {
      // Use defaults if fetch fails
    }
    return [
      {
        id: 'default',
        name: 'Kantor NicePlayland',
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LON,
        radius: DEFAULT_RADIUS,
      },
    ];
  }, []);

  // Get GPS position
  const getGpsPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung GPS. Gunakan browser modern.');
      setGpsLoading(false);
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsLoading(false);
      },
      (error) => {
        let msg = 'Gagal mendapatkan lokasi GPS.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Akses GPS ditolak. Aktifkan izin lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Lokasi tidak tersedia. Pastikan GPS aktif di perangkat Anda.';
            break;
          case error.TIMEOUT:
            msg = 'Waktu habis saat mendapatkan lokasi. Coba lagi.';
            break;
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  // Calculate distance from GPS to nearest office location
  const calculateDistance = useCallback(() => {
    if (!gpsPosition || locations.length === 0) return;

    let minDist = Infinity;
    let nearest: LocationData | null = null;

    for (const loc of locations) {
      const dist = haversineDistance(
        gpsPosition.latitude,
        gpsPosition.longitude,
        loc.latitude,
        loc.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    }

    setNearestDistance(Math.round(minDist * 100) / 100);
    setNearestLocation(nearest);
    setIsWithinRadius(nearest ? minDist <= nearest.radius : false);
  }, [gpsPosition, locations]);

  // Fetch attendance records
  const fetchAttendance = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/attendance?userId=${user.id}`);
      const json = await res.json();
      if (json.success) {
        const data = json.data as AttendanceRecord[];
        setRecords(data);

        // Find today's record
        const todayStr = new Date().toISOString().split('T')[0];
        const today = data.find((r: AttendanceRecord) => r.date.split('T')[0] === todayStr);
        setTodayRecord(today || null);
      }
    } catch {
      toast({ title: 'Gagal memuat data kehadiran', variant: 'destructive' });
    }
  }, [user?.id, toast]);

  // Initialize
  useEffect(() => {
    fetchLocations().then((locs) => {
      setLocations(locs);
      getGpsPosition();
    });
  }, [fetchLocations, getGpsPosition]);

  useEffect(() => {
    fetchAttendance().finally(() => setLoading(false));
  }, [fetchAttendance]);

  // Recalculate distance when GPS or locations change
  useEffect(() => {
    calculateDistance();
  }, [calculateDistance]);

  // Check In handler
  const handleCheckIn = async () => {
    if (!user?.id || !gpsPosition || !nearestLocation) return;

    setCheckingIn(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkin',
          userId: user.id,
          latitude: gpsPosition.latitude,
          longitude: gpsPosition.longitude,
          locationName: nearestLocation.name,
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast({
          title: 'Absen masuk berhasil',
          description: `Jam masuk: ${formatTime(json.data.checkInTime)}`,
        });
        await fetchAttendance();
        // Refresh GPS
        getGpsPosition();
      } else {
        toast({
          title: 'Gagal absen masuk',
          description: json.error || 'Terjadi kesalahan',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Gagal absen masuk', description: 'Kesalahan jaringan', variant: 'destructive' });
    } finally {
      setCheckingIn(false);
    }
  };

  // Check Out handler
  const handleCheckOut = async () => {
    if (!user?.id || !gpsPosition || !nearestLocation) return;

    setCheckingOut(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          userId: user.id,
          latitude: gpsPosition.latitude,
          longitude: gpsPosition.longitude,
          locationName: nearestLocation.name,
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast({
          title: 'Absen keluar berhasil',
          description: `Jam keluar: ${formatTime(json.data.checkOutTime)}`,
        });
        await fetchAttendance();
        getGpsPosition();
      } else {
        toast({
          title: 'Gagal absen keluar',
          description: json.error || 'Terjadi kesalahan',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Gagal absen keluar', description: 'Kesalahan jaringan', variant: 'destructive' });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate('employee-dashboard')}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Absensi Kehadiran</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* GPS Location Card */}
        <Card className="mb-6 border-emerald-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="size-5 text-emerald-600" />
              Lokasi GPS Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gpsLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-emerald-600" />
                <p className="text-sm text-gray-600">Mendapatkan lokasi...</p>
              </div>
            ) : gpsError ? (
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{gpsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={getGpsPosition}
                    >
                      Coba Lagi
                    </Button>
                  </div>
                </div>
              </div>
            ) : gpsPosition ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-700">Lokasi terdeteksi</p>
                  <p className="mt-1 font-mono text-sm text-emerald-800">
                    {gpsPosition.latitude}, {gpsPosition.longitude}
                  </p>
                </div>

                {nearestLocation && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Jarak ke {nearestLocation.name}</p>
                        <p className={`text-lg font-bold ${isWithinRadius ? 'text-emerald-600' : 'text-red-500'}`}>
                          {nearestDistance !== null ? `${nearestDistance} meter` : '-'}
                        </p>
                      </div>
                      <div
                        className={`flex items-center justify-center rounded-full ${isWithinRadius ? 'bg-emerald-100' : 'bg-red-100'}`}
                      >
                        {isWithinRadius ? (
                          <CheckCircle2 className="size-6 text-emerald-600" />
                        ) : (
                          <XCircle className="size-6 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Radius yang diizinkan: {nearestLocation.radius} meter
                    </p>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={getGpsPosition}
                >
                  <Navigation className="mr-2 size-3.5" />
                  Perbarui Lokasi
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Check-In/Check-Out Buttons */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {!todayRecord?.checkInTime && (
            <Button
              size="lg"
              className="h-20 w-full bg-emerald-600 text-base font-bold text-white shadow-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:shadow-none disabled:text-gray-500"
              disabled={!isWithinRadius || checkingIn || gpsLoading}
              onClick={handleCheckIn}
            >
              {checkingIn ? (
                <Loader2 className="mr-2 size-5 animate-spin" />
              ) : (
                <CalendarCheck className="mr-2 size-5" />
              )}
              Absen Masuk
            </Button>
          )}

          {todayRecord?.checkInTime && !todayRecord?.checkOutTime && (
            <Button
              size="lg"
              className="h-20 w-full bg-amber-500 text-base font-bold text-white shadow-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:shadow-none disabled:text-gray-500"
              disabled={checkingOut || gpsLoading}
              onClick={handleCheckOut}
            >
              {checkingOut ? (
                <Loader2 className="mr-2 size-5 animate-spin" />
              ) : (
                <Clock className="mr-2 size-5" />
              )}
              Absen Keluar
            </Button>
          )}

          {todayRecord?.checkInTime && todayRecord?.checkOutTime && (
            <Card className="col-span-2 border-emerald-100 bg-emerald-50">
              <CardContent className="flex items-center justify-center gap-2 py-4">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <p className="font-medium text-emerald-800">
                  Absensi hari ini selesai ({formatTime(todayRecord.checkOutTime)})
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Today's Status */}
        {todayRecord && (
          <Card className="mb-6 border-emerald-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status Hari Ini</span>
                {getStatusBadge(todayRecord.status)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Jam Masuk</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTime(todayRecord.checkInTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Jam Keluar</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatTime(todayRecord.checkOutTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card className="mb-6 border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-amber-800">
              <AlertTriangle className="size-5 text-amber-600" />
              Petunjuk Absensi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                  1
                </span>
                <span>Aktifkan GPS di perangkat Anda dan berikan izin lokasi ke browser.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                  2
                </span>
                <span>Pastikan Anda berada di lokasi kantor (radius {nearestLocation?.radius || DEFAULT_RADIUS} meter).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                  3
                </span>
                <span>Tekan tombol &quot;Absen Masuk&quot; (hijau) atau &quot;Absen Keluar&quot; (kuning).</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="size-5 text-emerald-600" />
              Riwayat Kehadiran Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 px-5 py-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Info className="size-8 text-gray-300" />
                <p className="text-sm text-gray-500">Belum ada riwayat kehadiran</p>
              </div>
            ) : (
              <div className="max-h-96 divide-y overflow-y-auto">
                {records.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateShort(record.date)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Masuk: {formatTime(record.checkInTime)} | Keluar: {formatTime(record.checkOutTime)}
                      </p>
                      {record.locationName && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="size-3" />
                          {record.locationName}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
