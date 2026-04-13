'use client';

import { useState } from 'react';
import {
  FerrisWheel,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Ticket,
  MapPin,
  ChevronDown,
  Shield,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  ScanLine,
  History,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const { currentView, navigate, user, isAuthenticated, logout } =
    useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isEmployee = user?.role === 'employee';

  const navLinks = [
    { label: 'Beranda', view: 'home', icon: FerrisWheel },
    { label: 'Wahana', view: 'rides', icon: MapPin },
  ];

  if (isAuthenticated) {
    navLinks.push({ label: 'Pesan Tiket', view: 'booking', icon: Ticket });
  }

  const handleNavigate = (view: string) => {
    navigate(view);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const isActive = (view: string) => currentView === view;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-200 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <FerrisWheel className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-emerald-800">
            NicePlayland
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.view}
                variant={isActive(link.view) ? 'secondary' : 'ghost'}
                className={
                  isActive(link.view)
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-900'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
                }
                onClick={() => handleNavigate(link.view)}
              >
                <Icon className="size-4" />
                {link.label}
              </Button>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <Avatar className="size-7">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate text-sm">
                      {user.name}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Visitor Links */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleNavigate('my-tickets')}>
                      <Ticket className="size-4" />
                      Tiket Saya
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigate('order-history')}>
                      <History className="size-4" />
                      Riwayat Pesanan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigate('profile')}>
                      <User className="size-4" />
                      Profil
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  {/* Admin Links */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleNavigate('admin-dashboard')}>
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate('admin-rides')}>
                          <MapPin className="size-4" />
                          Kelola Wahana
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate('admin-orders')}>
                          <ClipboardList className="size-4" />
                          Kelola Pesanan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate('admin-attendance')}>
                          <CalendarCheck className="size-4" />
                          Kehadiran Karyawan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate('admin-reports')}>
                          <BarChart3 className="size-4" />
                          Laporan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate('admin-validate')}>
                          <ScanLine className="size-4" />
                          Validasi Tiket
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}

                  {/* Employee Links */}
                  {isEmployee && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Karyawan</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleNavigate('employee-dashboard')}>
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate('employee-attendance')}>
                          <Clock className="size-4" />
                          Absensi
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNavigate('employee-schedule')}>
                          <CalendarCheck className="size-4" />
                          Jadwal
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => handleNavigate('login')}
              >
                Masuk
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleNavigate('register')}
              >
                Daftar
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                <Menu className="size-5" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[360px] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2 text-emerald-800">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <FerrisWheel className="size-4" />
                  </div>
                  NicePlayland
                </SheetTitle>
              </SheetHeader>

              <Separator className="mb-4" />

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 px-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <SheetClose asChild key={link.view}>
                      <Button
                        variant={isActive(link.view) ? 'secondary' : 'ghost'}
                        className={`w-full justify-start gap-3 ${isActive(link.view) ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                        onClick={() => handleNavigate(link.view)}
                      >
                        <Icon className="size-4" />
                        {link.label}
                      </Button>
                    </SheetClose>
                  );
                })}
              </nav>

              <Separator className="my-4" />

              {/* Auth Section */}
              {isAuthenticated && user ? (
                <div className="px-2">
                  {/* User Info */}
                  <div className="mb-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
                    <Avatar className="size-10">
                      {user.avatar && (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-emerald-200 text-sm font-semibold text-emerald-800">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Shield className="size-4 shrink-0 text-amber-600" />
                    )}
                    {isEmployee && (
                      <Clock className="size-4 shrink-0 text-blue-600" />
                    )}
                  </div>

                  {/* Account Links */}
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Akun Saya
                  </p>
                  <div className="flex flex-col gap-1">
                    {[
                      { label: 'Tiket Saya', view: 'my-tickets', icon: Ticket },
                      { label: 'Riwayat Pesanan', view: 'order-history', icon: History },
                      { label: 'Profil', view: 'profile', icon: User },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <SheetClose asChild key={item.view}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleNavigate(item.view)}
                          >
                            <Icon className="size-4" />
                            {item.label}
                          </Button>
                        </SheetClose>
                      );
                    })}
                  </div>

                  {/* Admin Links */}
                  {isAdmin && (
                    <>
                      <Separator className="my-4" />
                      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Admin Panel
                      </p>
                      <div className="flex flex-col gap-1">
                        {[
                          { label: 'Dashboard', view: 'admin-dashboard', icon: LayoutDashboard },
                          { label: 'Kelola Wahana', view: 'admin-rides', icon: MapPin },
                          { label: 'Kelola Pesanan', view: 'admin-orders', icon: ClipboardList },
                          { label: 'Kehadiran Karyawan', view: 'admin-attendance', icon: CalendarCheck },
                          { label: 'Laporan', view: 'admin-reports', icon: BarChart3 },
                          { label: 'Validasi Tiket', view: 'admin-validate', icon: ScanLine },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <SheetClose asChild key={item.view}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleNavigate(item.view)}
                              >
                                <Icon className="size-4" />
                                {item.label}
                              </Button>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Employee Links */}
                  {isEmployee && (
                    <>
                      <Separator className="my-4" />
                      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Karyawan
                      </p>
                      <div className="flex flex-col gap-1">
                        {[
                          { label: 'Dashboard', view: 'employee-dashboard', icon: LayoutDashboard },
                          { label: 'Absensi', view: 'employee-attendance', icon: Clock },
                          { label: 'Jadwal', view: 'employee-schedule', icon: CalendarCheck },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <SheetClose asChild key={item.view}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleNavigate(item.view)}
                              >
                                <Icon className="size-4" />
                                {item.label}
                              </Button>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <Separator className="my-4" />
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="size-4" />
                      Keluar
                    </Button>
                  </SheetClose>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleNavigate('login')}
                    >
                      Masuk
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => handleNavigate('register')}
                    >
                      Daftar Sekarang
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
