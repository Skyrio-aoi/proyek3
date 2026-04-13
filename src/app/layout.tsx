import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NicePlayland Indramayu - Destinasi Wisata Keluarga",
  description: "Platform digital NicePlayland Indramayu untuk informasi wahana, pemesanan tiket online, dan layanan pelanggan.",
  keywords: ["NicePlayland", "Indramayu", "Wisata", "Tiket", "Wahana", "Theme Park"],
  authors: [{ name: "NicePlayland" }],
  openGraph: {
    title: "NicePlayland Indramayu",
    description: "Destinasi wisata keluarga terbaik di Indramayu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
