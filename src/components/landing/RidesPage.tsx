'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Zap,
  Sparkles,
  Droplets,
  Clock,
  Ruler,
  Search,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/useAppStore'

interface Ride {
  id: string
  name: string
  description: string
  imageUrl?: string | null
  status: string
  category: string
  heightMin?: number | null
  heightMax?: number | null
  durationMinutes?: number | null
  createdAt: string
  updatedAt: string
}

const categoryConfig: Record<
  string,
  { label: string; gradient: string; badgeClass: string; icon: LucideIcon }
> = {
  family: {
    label: 'Keluarga',
    gradient: 'from-emerald-400 to-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    icon: Users,
  },
  extreme: {
    label: 'Ekstrem',
    gradient: 'from-red-400 to-red-600',
    badgeClass: 'bg-red-100 text-red-700 hover:bg-red-100',
    icon: Zap,
  },
  kids: {
    label: 'Anak-anak',
    gradient: 'from-amber-400 to-amber-600',
    badgeClass: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    icon: Sparkles,
  },
  water: {
    label: 'Air',
    gradient: 'from-cyan-400 to-cyan-600',
    badgeClass: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100',
    icon: Droplets,
  },
}

const categoryTabs = [
  { value: 'all', label: 'Semua' },
  { value: 'family', label: 'Keluarga' },
  { value: 'extreme', label: 'Ekstrem' },
  { value: 'kids', label: 'Anak-anak' },
  { value: 'water', label: 'Air' },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as const },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

function RideCard({ ride, index }: { ride: Ride; index: number }) {
  const config = categoryConfig[ride.category] || categoryConfig.family
  const isActive = ride.status === 'active'
  const isMaintenance = ride.status === 'maintenance'

  return (
    <motion.div variants={fadeInUp} custom={index}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        <div className={`h-28 bg-gradient-to-br ${config.gradient} flex items-center justify-center relative`}>
          <div className="text-white/15 text-6xl absolute select-none">
            {config.icon && <config.icon className="h-16 w-16" />}
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <Badge
              className={`${config.badgeClass} border-0 backdrop-blur-sm bg-white/25 text-white`}
            >
              <config.icon className="h-3.5 w-3.5 inline" />
              {config.label}
            </Badge>
          </div>
          {/* Status indicator */}
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
              <div
                className={`h-2 w-2 rounded-full ${
                  isActive
                    ? 'bg-green-300 animate-pulse'
                    : isMaintenance
                    ? 'bg-amber-300'
                    : 'bg-gray-300'
                }`}
              />
              <span className="text-white text-xs font-medium">
                {isActive ? 'Buka' : isMaintenance ? 'Perawatan' : 'Tutup'}
              </span>
            </div>
          </div>
        </div>
        <CardContent className="p-5 flex flex-col gap-3 flex-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{ride.name}</h3>
          <p className="text-gray-500 text-sm line-clamp-2 flex-1">{ride.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {ride.durationMinutes ? `${ride.durationMinutes} menit` : 'N/A'}
            </Badge>
            {ride.heightMin && (
              <Badge variant="secondary" className="text-xs">
                <Ruler className="mr-1 h-3 w-3" />
                Min. {ride.heightMin} cm
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RideCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md h-full flex flex-col">
      <Skeleton className="h-28 w-full rounded-none" />
      <CardContent className="p-5 flex flex-col gap-3 flex-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ category }: { category: string }) {
  const categoryLabel =
    category === 'all'
      ? 'wahana'
      : categoryConfig[category]?.label?.toLowerCase() || category

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Wahana Tidak Ditemukan
      </h3>
      <p className="text-gray-500 text-sm max-w-md">
        Belum ada wahana {categoryLabel} yang tersedia saat ini. Silakan cek kembali nanti atau pilih
        kategori lain.
      </p>
    </motion.div>
  )
}

export default function RidesPage() {
  const { navigate, currentView } = useAppStore()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    async function fetchRides() {
      try {
        setLoading(true)
        const res = await fetch('/api/rides')
        const json = await res.json()
        if (json.success && json.data) {
          setRides(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch rides:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRides()
  }, [])

  const filteredRides =
    activeTab === 'all'
      ? rides
      : rides.filter((r) => r.category === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            <motion.h1
              className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              Daftar Wahana
            </motion.h1>
            <motion.p
              className="mt-3 text-white/85 text-lg max-w-2xl mx-auto"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.15 } } }}
            >
              Temukan wahana seru yang sesuai dengan selera Anda. Dari yang santai hingga memacu adrenalin!
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.25 } } }}
              className="mt-6"
            >
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate('home')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filter and Grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category Filter Tabs */}
          <div className="mb-8 flex justify-center">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white shadow-sm border p-1 h-auto flex-wrap gap-1">
                {categoryTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-2 text-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <RideCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredRides.length === 0 && (
            <EmptyState category={activeTab} />
          )}

          {/* Ride Cards Grid */}
          {!loading && filteredRides.length > 0 && (
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              key={activeTab}
              variants={staggerContainer}
            >
              {filteredRides.map((ride, index) => (
                <RideCard key={ride.id} ride={ride} index={index} />
              ))}
            </motion.div>
          )}

          {/* Ride Count */}
          {!loading && filteredRides.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Menampilkan {filteredRides.length} wahana
              {activeTab !== 'all' && (
                <span>
                  {' '}
                  dalam kategori{' '}
                  <span className="font-medium text-gray-700">
                    {categoryConfig[activeTab]?.label || activeTab}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} NicePlayland Indramayu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
