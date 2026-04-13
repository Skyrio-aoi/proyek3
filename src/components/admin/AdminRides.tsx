'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  MapPin,
  Clock,
  Ruler,
  Save,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/store/useAppStore';

interface Ride {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  durationMinutes: number | null;
  heightMin: number | null;
  heightMax: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Aktif', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  inactive: { label: 'Tidak Aktif', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  maintenance: { label: 'Perawatan', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
};

const categoryOptions = [
  { value: 'family', label: 'Keluarga' },
  { value: 'extreme', label: 'Ekstrem' },
  { value: 'kids', label: 'Anak-anak' },
  { value: 'water', label: 'Air' },
];

const statusOptions = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
  { value: 'maintenance', label: 'Perawatan' },
];

interface RideFormData {
  name: string;
  description: string;
  category: string;
  status: string;
  durationMinutes: string;
  heightMin: string;
  heightMax: string;
}

const emptyForm: RideFormData = {
  name: '',
  description: '',
  category: 'family',
  status: 'active',
  durationMinutes: '',
  heightMin: '',
  heightMax: '',
};

export default function AdminRides() {
  const navigate = useAppStore((s) => s.navigate);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [deletingRide, setDeletingRide] = useState<Ride | null>(null);
  const [form, setForm] = useState<RideFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  async function fetchRides() {
    try {
      const res = await fetch('/api/rides');
      const json = await res.json();
      if (json.success) {
        setRides(json.data);
      } else {
        toast.error('Gagal memuat data wahana');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRides();
  }, []);

  function openCreate() {
    setEditingRide(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(ride: Ride) {
    setEditingRide(ride);
    setForm({
      name: ride.name,
      description: ride.description,
      category: ride.category || 'family',
      status: ride.status || 'active',
      durationMinutes: ride.durationMinutes?.toString() || '',
      heightMin: ride.heightMin?.toString() || '',
      heightMax: ride.heightMax?.toString() || '',
    });
    setDialogOpen(true);
  }

  function openDelete(ride: Ride) {
    setDeletingRide(ride);
    setDeleteDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Nama dan deskripsi wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        status: form.status,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes, 10) : null,
        heightMin: form.heightMin ? parseInt(form.heightMin, 10) : null,
        heightMax: form.heightMax ? parseInt(form.heightMax, 10) : null,
      };

      let res: Response;
      if (editingRide) {
        res = await fetch('/api/rides', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingRide.id, ...payload }),
        });
      } else {
        res = await fetch('/api/rides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        toast.success(editingRide ? 'Wahana berhasil diperbarui' : 'Wahana berhasil ditambahkan');
        setDialogOpen(false);
        fetchRides();
      } else {
        toast.error(json.error || 'Gagal menyimpan wahana');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingRide) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/rides', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingRide.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Wahana berhasil dihapus');
        setDeleteDialogOpen(false);
        setDeletingRide(null);
        fetchRides();
      } else {
        toast.error(json.error || 'Gagal menghapus wahana');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus');
    } finally {
      setSubmitting(false);
    }
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
              <MapPin className="size-6 text-emerald-600" />
              Kelola Wahana
            </h1>
            <p className="text-sm text-gray-500">{rides.length} wahana terdaftar</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          Tambah Wahana
        </Button>
      </div>

      {/* Rides Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rides.length > 0 ? (
                  rides.map((ride) => {
                    const sc = statusConfig[ride.status] || statusConfig.inactive;
                    const cat = categoryOptions.find((c) => c.value === ride.category);
                    return (
                      <TableRow key={ride.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ride.name}</p>
                            <p className="max-w-xs truncate text-xs text-gray-500">
                              {ride.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cat?.label || ride.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sc.className}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="size-3.5" />
                            {ride.durationMinutes ? `${ride.durationMinutes} menit` : '-'}
                          </div>
                          {ride.heightMin != null && ride.heightMax != null && (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                              <Ruler className="size-3" />
                              {ride.heightMin}-{ride.heightMax} cm
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(ride)}>
                              <Pencil className="size-4 text-emerald-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDelete(ride)}>
                              <Trash2 className="size-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-gray-400">
                      Belum ada data wahana
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRide ? 'Edit Wahana' : 'Tambah Wahana Baru'}</DialogTitle>
            <DialogDescription>
              {editingRide ? 'Perbarui informasi wahana' : 'Isi detail wahana baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="ride-name">Nama Wahana *</Label>
              <Input
                id="ride-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="contoh: Roller Coaster Naga Emas"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ride-desc">Deskripsi *</Label>
              <Textarea
                id="ride-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi wahana..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ride-duration">Durasi (menit)</Label>
                <Input
                  id="ride-duration"
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ride-hmin">Tinggi Min (cm)</Label>
                <Input
                  id="ride-hmin"
                  type="number"
                  value={form.heightMin}
                  onChange={(e) => setForm({ ...form, heightMin: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ride-hmax">Tinggi Max (cm)</Label>
                <Input
                  id="ride-hmax"
                  type="number"
                  value={form.heightMax}
                  onChange={(e) => setForm({ ...form, heightMax: e.target.value })}
                  placeholder="200"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              <X className="mr-2 size-4" />
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editingRide ? 'Simpan Perubahan' : 'Tambah Wahana'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Wahana</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus wahana &quot;{deletingRide?.name}&quot;? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
