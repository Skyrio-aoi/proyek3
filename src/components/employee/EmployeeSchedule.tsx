'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  AlertCircle,
  Sun,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';

interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface DaySchedule {
  day: string;
  dayIndex: number;
  shift: string;
  hours: string;
  isWorkDay: boolean;
}

const DAYS_OF_WEEK: DaySchedule[] = [
  { day: 'Senin', dayIndex: 1, shift: 'Pagi', hours: '08:00 - 17:00', isWorkDay: true },
  { day: 'Selasa', dayIndex: 2, shift: 'Pagi', hours: '08:00 - 17:00', isWorkDay: true },
  { day: 'Rabu', dayIndex: 3, shift: 'Pagi', hours: '08:00 - 17:00', isWorkDay: true },
  { day: 'Kamis', dayIndex: 4, shift: 'Pagi', hours: '08:00 - 17:00', isWorkDay: true },
  { day: 'Jumat', dayIndex: 5, shift: 'Pagi', hours: '08:00 - 17:00', isWorkDay: true },
  { day: 'Sabtu', dayIndex: 6, shift: 'Pagi', hours: '08:00 - 12:00', isWorkDay: true },
  { day: 'Minggu', dayIndex: 0, shift: '-', hours: 'Libur', isWorkDay: false },
];

const SHIFT_COLORS = {
  Pagi: 'bg-emerald-100 text-emerald-700',
  Siang: 'bg-amber-100 text-amber-700',
  Malam: 'bg-indigo-100 text-indigo-700',
  '-': 'bg-gray-100 text-gray-500',
};

export default function EmployeeSchedule() {
  const { navigate } = useAppStore();
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex] = useState(new Date().getDay());

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/locations');
        const json = await res.json();
        if (json.success) {
          setLocations(json.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const primaryLocation = locations[0] || {
    id: 'default',
    name: 'Kantor NicePlayland',
    latitude: -6.3288,
    longitude: 108.3277,
    radius: 10,
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
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Jadwal Kerja</h1>
            <p className="text-sm text-gray-500">
              Jadwal shift dan informasi kerja Anda
            </p>
          </div>
        </div>

        {/* Weekly Schedule */}
        <Card className="mb-6 border-emerald-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="size-5 text-emerald-600" />
              Jadwal Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {DAYS_OF_WEEK.map((schedule) => {
                  const isToday = schedule.dayIndex === currentDayIndex;
                  return (
                    <div
                      key={schedule.day}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        isToday
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isToday
                              ? 'bg-emerald-600 text-white'
                              : schedule.isWorkDay
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {schedule.day.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isToday ? 'text-emerald-800' : 'text-gray-900'}`}>
                            {schedule.day}
                            {isToday && (
                              <Badge className="ml-2 border-0 bg-emerald-600 text-white">
                                Hari Ini
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Shift {schedule.shift}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${schedule.isWorkDay ? 'text-gray-700' : 'text-gray-400'}`}>
                          {schedule.hours}
                        </p>
                        <Badge
                          className={`text-xs ${SHIFT_COLORS[schedule.shift as keyof typeof SHIFT_COLORS] || 'bg-gray-100 text-gray-500'}`}
                        >
                          {schedule.isWorkDay ? schedule.shift : 'Libur'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Hours Summary */}
        <Card className="mb-6 border-emerald-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-5 text-emerald-600" />
              Ringkasan Jam Kerja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">6</p>
                <p className="text-xs text-emerald-600">Hari Kerja / Minggu</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">52</p>
                <p className="text-xs text-amber-600">Jam / Minggu</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Jam Masuk (Senin-Jumat)</span>
                <span className="font-medium text-gray-900">08:00 WIB</span>
              </div>
              <div className="flex justify-between">
                <span>Jam Pulang (Senin-Jumat)</span>
                <span className="font-medium text-gray-900">17:00 WIB</span>
              </div>
              <div className="flex justify-between">
                <span>Jam Masuk (Sabtu)</span>
                <span className="font-medium text-gray-900">08:00 WIB</span>
              </div>
              <div className="flex justify-between">
                <span>Jam Pulang (Sabtu)</span>
                <span className="font-medium text-gray-900">12:00 WIB</span>
              </div>
              <div className="flex justify-between">
                <span>Istirahat</span>
                <span className="font-medium text-gray-900">12:00 - 13:00</span>
              </div>
              <div className="flex justify-between">
                <span>Batas Terlambat</span>
                <span className="font-medium text-red-600">09:00 WIB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Info & Contact */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Office Location */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-5 text-emerald-600" />
                Lokasi Kantor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-sm font-semibold text-emerald-800">{primaryLocation.name}</p>
                <p className="mt-1 text-xs text-emerald-600">
                  Jl. Raya Indramayu, Kabupaten Indramayu, Jawa Barat
                </p>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gray-400" />
                <div>
                  <p className="font-mono text-xs">
                    {primaryLocation.latitude}, {primaryLocation.longitude}
                  </p>
                  <p className="text-xs text-gray-400">Radius GPS: {primaryLocation.radius} meter</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="size-5 text-emerald-600" />
                Kontak & Darurat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700">Kontak Admin</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="size-4 shrink-0 text-gray-400" />
                <span>admin@niceplayland.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="size-4 shrink-0 text-gray-400" />
                <span>+62 812 3456 7890</span>
              </div>
              <Separator />
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-700">Kontak Darurat</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="size-4 shrink-0 text-red-400" />
                <span>+62 811 2233 4455</span>
              </div>
              <p className="text-xs text-gray-400">
                Hubungi nomor darurat hanya untuk keadaan mendesak.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
