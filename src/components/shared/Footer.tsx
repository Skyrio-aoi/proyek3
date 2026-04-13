'use client';

import {
  FerrisWheel,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';

export default function Footer() {
  const { navigate } = useAppStore();

  const handleNavigate = (view: string) => {
    navigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t border-emerald-100 bg-emerald-950 text-emerald-100">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <FerrisWheel className="size-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                NicePlayland
              </span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-emerald-300/70">
              Taman hiburan terbesar di Indramayu. Nikmati berbagai wahana seru
              dan pengalaman tak terlupakan bersama keluarga dan teman-teman
              Anda.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3">
              <button
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-400 transition-colors hover:bg-emerald-800 hover:text-white"
              >
                <Instagram className="size-4" />
              </button>
              <button
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-400 transition-colors hover:bg-emerald-800 hover:text-white"
              >
                <Facebook className="size-4" />
              </button>
              <button
                aria-label="Twitter"
                className="flex size-9 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-400 transition-colors hover:bg-emerald-800 hover:text-white"
              >
                <Twitter className="size-4" />
              </button>
              <button
                aria-label="Youtube"
                className="flex size-9 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-400 transition-colors hover:bg-emerald-800 hover:text-white"
              >
                <Youtube className="size-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Navigasi
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Beranda', view: 'home' },
                { label: 'Wahana', view: 'rides' },
                { label: 'Pesan Tiket', view: 'booking' },
                { label: 'Tiket Saya', view: 'my-tickets' },
              ].map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => handleNavigate(link.view)}
                    className="text-sm text-emerald-300/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Informasi
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Tentang Kami', view: 'home' },
                { label: 'Syarat & Ketentuan', view: 'home' },
                { label: 'Kebijakan Privasi', view: 'home' },
                { label: 'FAQ', view: 'home' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavigate(link.view)}
                    className="text-sm text-emerald-300/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Hubungi Kami
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span className="text-sm leading-relaxed text-emerald-300/70">
                  Jl. Raya Indramayu, Kabupaten Indramayu, Jawa Barat
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-emerald-400" />
                <span className="text-sm text-emerald-300/70">
                  +62 231 1234 5678
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-emerald-400" />
                <span className="text-sm text-emerald-300/70">
                  info@niceplayland.id
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-emerald-900" />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-emerald-400/60">
            &copy; {new Date().getFullYear()} NicePlayland. Semua hak cipta
            dilindungi.
          </p>
          <p className="text-xs text-emerald-400/60">
            Dibuat dengan dedikasi untuk pengalaman bermain terbaik
          </p>
        </div>
      </div>
    </footer>
  );
}
