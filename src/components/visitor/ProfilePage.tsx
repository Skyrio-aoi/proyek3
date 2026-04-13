'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Edit,
  Settings,
  Ticket,
  History,
  ShoppingBag,
  Loader2,
  Save,
  Shield,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { formatDate } from '@/lib/currency'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { user, logout, navigate, setUser } = useAppStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('auth')
      return
    }
    setEditName(user.name)
    setEditPhone(user.phone || '')
  }, [user, navigate])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateProfile',
          userId: user.id,
          name: editName,
          phone: editPhone || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setUser({
          ...user!,
          name: editName,
          phone: editPhone || undefined,
        })
        setEditing(false)
        toast({
          title: 'Berhasil',
          description: 'Profil berhasil diperbarui',
        })
      } else {
        toast({
          title: 'Gagal',
          description: data.error || 'Gagal memperbarui profil',
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
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: 'Keluar',
      description: 'Anda telah berhasil keluar',
    })
  }

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roleConfig: Record<string, { label: string; className: string }> = {
    visitor: {
      label: 'Pengunjung',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    admin: {
      label: 'Admin',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    employee: {
      label: 'Karyawan',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
  }

  const role = roleConfig[user.role] || {
    label: user.role,
    className: '',
  }

  const navLinks = [
    {
      label: 'Pesan Tiket',
      icon: ShoppingBag,
      page: 'booking' as const,
      description: 'Beli tiket baru untuk kunjungan Anda',
    },
    {
      label: 'Riwayat Pesanan',
      icon: History,
      page: 'order-history' as const,
      description: 'Lihat semua pesanan tiket',
    },
    {
      label: 'Tiket Saya',
      icon: Ticket,
      page: 'my-tickets' as const,
      description: 'Lihat tiket aktif dan QR code',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('home')}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          Kembali
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
          <p className="text-muted-foreground mt-1">Kelola informasi akun Anda</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-start gap-5">
              <Avatar className="w-20 h-20 border-4 border-emerald-100 shadow-sm">
                <AvatarFallback className="bg-emerald-500 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold truncate">{user.name}</h2>
                  <Badge variant="outline" className={role.className}>
                    <Shield className="w-3 h-3 mr-1" />
                    {role.label}
                  </Badge>
                </div>
                <div className="space-y-1.5 mt-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      {user.phone}
                    </p>
                  )}
                  {user.createdAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      Bergabung sejak {formatDate(user.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-muted-foreground" />
                Informasi Pribadi
              </CardTitle>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Nama Lengkap</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Nomor Telepon</Label>
                  <Input
                    id="editPhone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Masukkan nomor telepon (opsional)"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setEditName(user.name)
                      setEditPhone(user.phone || '')
                    }}
                    disabled={saving}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !editName.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Simpan Perubahan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nama</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3 py-2">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telepon</p>
                    <p className="font-medium">{user.phone || 'Belum diatur'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {navLinks.map((link) => {
                const IconComp = link.icon
                return (
                  <button
                    key={link.page}
                    onClick={() => navigate(link.page)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{link.label}</p>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 shrink-0" />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-red-200">
          <CardContent className="py-4">
            <Button
              variant="ghost"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar dari Akun
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
