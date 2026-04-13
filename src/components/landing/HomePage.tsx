'use client'

import { motion } from 'framer-motion'
import {
  Ticket,
  MapPin,
  Clock,
  Star,
  Users,
  Shield,
  Building2,
  ArrowRight,
  Sparkles,
  Zap,
  Droplets,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

interface FeaturedRide {
  name: string
  description: string
  category: 'family' | 'extreme' | 'kids' | 'water'
}

const featuredRides: FeaturedRide[] = [
  {
    name: 'Roller Coaster Naga Emas',
    description: 'Wahana roller coaster tercepat di Jawa Barat dengan putaran 360 derajat yang memacu adrenalin.',
    category: 'extreme',
  },
  {
    name: 'Kereta Misteri',
    description: 'Perjalanan kereta gelap yang penuh kejutan dan mistis di dalam gua buatan.',
    category: 'family',
  },
  {
    name: 'Istana Peri',
    description: 'Dunia dongeng yang menakjubkan untuk anak-anak dengan permainan interaktif dan pertunjukan.',
    category: 'kids',
  },
  {
    name: 'Sungai Petualangan',
    description: 'Seluncuran air yang seru dengan arus deras dan percikan air yang menyegarkan.',
    category: 'water',
  },
]

import type { LucideIcon } from 'lucide-react'

const categoryConfig: Record<string, { label: string; gradient: string; icon: LucideIcon }> = {
  family: {
    label: 'Keluarga',
    gradient: 'from-emerald-400 to-emerald-600',
    icon: Users,
  },
  extreme: {
    label: 'Ekstrem',
    gradient: 'from-red-400 to-red-600',
    icon: Zap,
  },
  kids: {
    label: 'Anak-anak',
    gradient: 'from-amber-400 to-amber-600',
    icon: Sparkles,
  },
  water: {
    label: 'Air',
    gradient: 'from-cyan-400 to-cyan-600',
    icon: Droplets,
  },
}

interface Testimonial {
  name: string
  initials: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Rina Susanti',
    initials: 'RS',
    rating: 5,
    text: 'Tempat yang sangat menyenangkan untuk keluarga! Anak-anak betah bermain seharian. Wahana yang beragam dan bersih.',
  },
  {
    name: 'Budi Hartono',
    initials: 'BH',
    rating: 5,
    text: 'Harga tiket sangat terjangkau dengan fasilitas yang lengkap. Roller Coaster Naga Emas benar-benar memacu adrenalin!',
  },
  {
    name: 'Siti Nurhaliza',
    initials: 'SN',
    rating: 4,
    text: 'Sudah beberapa kali datang ke sini dan selalu puas. Makanannya enak, parkir luas, dan petugasnya ramah.',
  },
]

const infoCards = [
  {
    icon: <Ticket className="h-6 w-6" />,
    title: 'Harga Tiket',
    description: 'Rp 35.000/orang',
    detail: 'Akses semua wahana',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Jam Operasional',
    description: '09:00 - 17:00 WIB',
    detail: 'Senin - Minggu',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Lokasi',
    description: 'Jl. Raya Indramayu',
    detail: 'Jawa Barat',
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: 'Fasilitas',
    description: 'Parkir Luas',
    detail: 'Mushola, Kantin, Toilet',
  },
]

export default function HomePage() {
  const { isAuthenticated, navigate, currentView } = useAppStore()

  const handleBookTicket = () => {
    if (isAuthenticated) {
      navigate('booking')
    } else {
      navigate('auth')
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600" />
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <motion.div
            className="flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30 px-4 py-1.5 text-sm">
                <Star className="mr-1.5 h-3.5 w-3.5" />
                Wisata Keluarga #1 di Indramayu
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              variants={fadeInUp}
              custom={1}
            >
              NicePlayland Indramayu
            </motion.h1>

            <motion.p
              className="mt-4 max-w-2xl text-lg text-white/90 sm:text-xl"
              variants={fadeInUp}
              custom={2}
            >
              Destinasi Wisata Keluarga Terbaik di Indramayu
            </motion.p>

            <motion.p
              className="mt-2 max-w-xl text-base text-white/75"
              variants={fadeInUp}
              custom={3}
            >
              Nikmati puluhan wahana seru, kuliner lezat, dan momen tak terlupakan bersama orang tersayang.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col gap-4 sm:flex-row"
              variants={fadeInUp}
              custom={4}
            >
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-white/90 font-semibold text-base px-8 h-12 shadow-lg"
                onClick={handleBookTicket}
              >
                <Ticket className="mr-2 h-5 w-5" />
                Pesan Tiket Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold text-base px-8 h-12 backdrop-blur-sm"
                onClick={() => navigate('rides')}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Lihat Wahana
              </Button>
            </motion.div>

            <motion.div
              className="mt-10 flex flex-wrap justify-center gap-8 text-white/80 text-sm"
              variants={fadeInUp}
              custom={5}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Aman &amp; Nyaman</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>500.000+ Pengunjung</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Rating 4.8/5</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {infoCards.map((card, index) => (
              <motion.div key={card.title} variants={fadeInUp} custom={index}>
                <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white h-full">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                      {card.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{card.title}</h3>
                    <p className="text-emerald-600 font-bold text-xl">{card.description}</p>
                    <p className="text-gray-500 text-sm">{card.detail}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Attractions Preview Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
          >
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-4 py-1">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Wahana Populer
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Pilihan Wahana Terbaik
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Temukan berbagai wahana seru yang cocok untuk semua anggota keluarga, dari yang santai hingga memacu adrenalin.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {featuredRides.map((ride, index) => {
              const config = categoryConfig[ride.category]
              return (
                <motion.div key={ride.name} variants={fadeInUp} custom={index}>
                  <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <div
                      className={`h-36 bg-gradient-to-br ${config.gradient} flex items-center justify-center relative`}
                    >
                      <div className="text-white/20 text-6xl font-black absolute select-none">
                        {config.icon && <config.icon className="h-20 w-20" />}
                      </div>
                      <div className="relative z-10 text-white text-center">
                        <div className="mb-1 text-white/80 text-sm">{config.label}</div>
                      </div>
                    </div>
                    <CardContent className="p-5 flex flex-col gap-3 flex-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {ride.name}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 flex-1">
                        {ride.description}
                      </p>
                      <button
                        className="mt-auto inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors group/btn"
                        onClick={() => navigate('rides')}
                      >
                        Lihat Detail
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            className="mt-10 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={4}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
              onClick={() => navigate('rides')}
            >
              Lihat Semua Wahana
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Promo Banner Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/promo-banner.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            <div className="flex-1 text-center lg:text-left">
              <motion.div variants={fadeInUp} custom={0}>
                <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30 px-4 py-1.5">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Promo Spesial
                </Badge>
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-white sm:text-4xl"
                variants={fadeInUp}
                custom={1}
              >
                Diskon 20% untuk Rombongan!
              </motion.h2>
              <motion.p
                className="mt-3 text-white/90 text-lg max-w-lg"
                variants={fadeInUp}
                custom={2}
              >
                Ajak keluarga atau teman-teman Anda minimal 10 orang dan nikmati diskon spesial untuk tiket masuk NicePlayland. Berlaku setiap hari!
              </motion.p>
              <motion.div
                className="mt-3 flex flex-wrap items-center gap-4 justify-center lg:justify-start"
                variants={fadeInUp}
                custom={3}
              >
                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <span className="text-sm text-white/80">Min.</span>{' '}
                  <span className="font-bold text-xl">10</span>{' '}
                  <span className="text-sm text-white/80">orang</span>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                  <span className="text-sm text-white/80">Hemat</span>{' '}
                  <span className="font-bold text-xl">20%</span>
                </div>
              </motion.div>
            </div>
            <motion.div variants={fadeInUp} custom={4}>
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-white/90 font-semibold text-base px-10 h-14 shadow-xl"
                onClick={handleBookTicket}
              >
                <Ticket className="mr-2 h-5 w-5" />
                Pesan Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
          >
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-4 py-1">
              <Star className="mr-1.5 h-3.5 w-3.5" />
              Testimoni
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Apa Kata Pengunjung Kami
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Ribuan keluarga telah merasakan keseruan di NicePlayland. Berikut ulasan dari mereka.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={fadeInUp} custom={index}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm shrink-0">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {testimonial.name}
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < testimonial.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white">NicePlayland Indramayu</h3>
              <p className="text-sm mt-1">Destinasi Wisata Keluarga Terbaik di Indramayu</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jl. Raya Indramayu, Jawa Barat</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>09:00 - 17:00 WIB</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} NicePlayland Indramayu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
