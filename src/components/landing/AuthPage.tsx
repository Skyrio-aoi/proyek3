'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Ticket,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppStore } from '@/store/useAppStore'
import type { AppUser } from '@/store/useAppStore'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 6
}

export default function AuthPage({ initialMode }: { initialMode?: 'login' | 'register' }) {
  const { navigate, setUser, currentView } = useAppStore()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode || (currentView === 'register' ? 'register' : 'login'))

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginShowPassword, setLoginShowPassword] = useState(false)
  const [loginRemember, setLoginRemember] = useState(false)

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regShowPassword, setRegShowPassword] = useState(false)

  // Shared
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!loginEmail.trim()) {
      setError('Email wajib diisi.')
      return
    }
    if (!validateEmail(loginEmail)) {
      setError('Format email tidak valid.')
      return
    }
    if (!loginPassword) {
      setError('Password wajib diisi.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      })

      const json = await res.json()

      if (json.success && json.data) {
        const userData: AppUser = {
          id: json.data.id,
          email: json.data.email,
          name: json.data.name,
          phone: json.data.phone,
          role: json.data.role,
          avatar: json.data.avatar,
        }
        setUser(userData)
        toast.success(`Selamat datang, ${userData.name}!`)
        navigate('home')
      } else {
        setError(json.error || 'Login gagal. Silakan coba lagi.')
      }
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!regName.trim()) {
      setError('Nama wajib diisi.')
      return
    }
    if (!regEmail.trim()) {
      setError('Email wajib diisi.')
      return
    }
    if (!validateEmail(regEmail)) {
      setError('Format email tidak valid.')
      return
    }
    if (regPhone && !/^[0-9+\-\s()]{8,15}$/.test(regPhone.trim())) {
      setError('Nomor telepon tidak valid.')
      return
    }
    if (!regPassword) {
      setError('Password wajib diisi.')
      return
    }
    if (!validatePassword(regPassword)) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim() || undefined,
          password: regPassword,
        }),
      })

      const json = await res.json()

      if (json.success && json.data) {
        const userData: AppUser = {
          id: json.data.id,
          email: json.data.email,
          name: json.data.name,
          phone: json.data.phone,
          role: json.data.role,
          avatar: json.data.avatar,
        }
        setUser(userData)
        toast.success('Registrasi berhasil! Selamat datang.')
        navigate('home')
      } else {
        setError(json.error || 'Registrasi gagal. Silakan coba lagi.')
      }
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <div className="py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 -ml-2"
            onClick={() => navigate('home')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <Ticket className="h-7 w-7" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">NicePlayland</h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'login'
                ? 'Masuk ke akun Anda untuk melanjutkan'
                : 'Buat akun baru untuk memulai petualangan'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => switchMode('login')}
            >
              Masuk
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => switchMode('register')}
            >
              Daftar
            </button>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 sm:p-8">
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5"
                >
                  <Alert variant="destructive">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={loginShowPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setLoginShowPassword(!loginShowPassword)}
                        tabIndex={-1}
                        aria-label={loginShowPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {loginShowPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                      id="login-remember"
                      checked={loginRemember}
                      onCheckedChange={(checked) => setLoginRemember(checked === true)}
                    />
                    <Label htmlFor="login-remember" className="text-sm font-normal text-gray-600 cursor-pointer">
                      Ingat saya
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Masuk'
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                      onClick={() => switchMode('register')}
                    >
                      Daftar sekarang
                    </button>
                  </p>
                </form>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        className="pl-10"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="nama@email.com"
                        className="pl-10"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-phone">
                      Nomor Telepon{' '}
                      <span className="text-gray-400 font-normal">(opsional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        className="pl-10"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-password"
                        type={regShowPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        className="pl-10 pr-10"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        tabIndex={-1}
                        aria-label={regShowPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      >
                        {regShowPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reg-confirm-password">Konfirmasi Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-confirm-password"
                        type={regShowPassword ? 'text' : 'password'}
                        placeholder="Ulangi password"
                        className="pl-10"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Daftar'
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                      onClick={() => switchMode('login')}
                    >
                      Masuk di sini
                    </button>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} NicePlayland Indramayu. All rights reserved.</p>
      </footer>
    </div>
  )
}
