'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = React.useState('');

  // Notifications State
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Ambil nilai 'q' dari URL saat ini
  const currentQuery = searchParams.get('q') || '';

  // Sinkronkan isi kotak input jika URL berubah (misal pindah halaman)
  React.useEffect(() => {
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  // 1. Logika Tema (Local Storage)
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('admin_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // 2. Logika Scroll
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Ambil Data Profil Admin
  React.useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nim, avatar_url')
            .eq('id', user.id)
            .single();

          if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          } else if (profile?.nim) {
            setAvatarUrl(
              `https://krs.umm.ac.id/Poto/${profile.nim.slice(0, 4)}/${profile.nim}.JPG`
            );
          }
        }
      } catch (error) {
        console.error('Error fetching admin avatar:', error);
      }
    };

    fetchAdminData();
  }, [supabase]);

  // 4. Tarik Notifikasi (Laporan Pending)
  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('id, reason, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data) {
          setNotifications(data);
          setUnreadCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [supabase]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 5. PERBAIKAN LOGIKA SEARCH: Saring langsung di halaman aktif lewat URL Query
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim() !== '') {
        // Ubah URL halaman aktif saat ini dengan parameter ?q=
        router.push(`${pathname}?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        // Jika kosong, bersihkan parameter pencarian dari URL
        router.push(pathname);
      }
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all duration-300 selection:bg-cyan-500/35 selection:text-cyan-900 dark:selection:text-white ${isDark ? 'dark bg-[#07090e] text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
    >
      {/* Top Navbar */}
      <header
        className={`
          sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-all duration-500 relative
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/5 before:via-transparent before:to-blue-500/5 before:pointer-events-none
          ${isDark
            ? isScrolled
              ? 'bg-[#090d16]/70 border-slate-800 shadow-lg shadow-black/20'
              : 'bg-[#090d16]/95 border-slate-800'
            : isScrolled
              ? 'bg-white/70 border-slate-200 shadow-lg shadow-slate-200/50'
              : 'bg-white/95 border-slate-200'
          }
        `}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>

          {/* Logo Brand & Main Links */}
          <div className="flex items-center gap-8 lg:gap-12 h-full">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/50">
                <ShieldAlert className="h-4.5 w-4.5 text-cyan-500" />
              </div>
              <span className={`text-xl font-bold tracking-tight select-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Student<span className="text-cyan-500">Hub</span>
              </span>
            </Link>

            {/* Main Desktop Links */}
            <nav className="hidden md:flex items-center gap-8 h-full">
              {navItems.map((item) => {
                const isUsersTab = item.path === '/admin/users';
                const isActive = pathname === item.path || (isUsersTab && pathname.startsWith('/admin/portfolios'));

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`relative h-full flex items-center text-[13px] font-bold tracking-wide uppercase transition-all duration-300 ${isActive
                      ? 'text-cyan-500 dark:text-cyan-400'
                      : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0'
                        }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* Search Input (Desktop) - Menangkap tombol Enter */}
            <div className="relative hidden lg:block w-56">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Type and press Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className={`w-full h-9 rounded-lg pl-9 pr-4 text-xs focus:outline-none transition-all ${isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-500 focus:border-cyan-500/50'
                  : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20'
                  }`}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
              title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notification Dropdown Wrapper */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`relative p-2 rounded-xl transition-all hover:scale-105 ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-[#090d16]" />
                )}
              </button>

              {/* Popup Notifications */}
              {isNotificationOpen && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                    <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Alerts & Reports</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full">
                        {unreadCount} Pending
                      </span>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <Link
                          href="/admin/reports"
                          key={notif.id}
                          onClick={() => setIsNotificationOpen(false)}
                          className={`block p-4 border-b last:border-0 transition-colors ${isDark ? 'border-slate-800/50 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="mt-0.5 rounded-full p-1.5 bg-amber-500/10 text-amber-500 shrink-0">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>New Report: {notif.reason}</p>
                              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Action required. Click to view details.</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <ShieldAlert className={`h-8 w-8 mb-3 opacity-20 ${isDark ? 'text-slate-300' : 'text-slate-500'}`} />
                        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>All caught up! No pending alerts.</p>
                      </div>
                    )}
                  </div>

                  <div className={`p-2 border-t text-center ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                    <Link
                      href="/admin/reports"
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-[11px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-wider"
                    >
                      View All Reports
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center border overflow-hidden transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-cyan-400/50 cursor-pointer ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-200'
                }`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <User className={`h-4.5 w-4.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              )}
            </div>

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 hover:scale-105 transition-all duration-300 ml-1"
              title="Keluar"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl md:hidden ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        {isMobileMenuOpen && (
          <div className={`md:hidden px-6 pb-5 pt-3 border-t space-y-3 shadow-xl ${isDark ? 'border-slate-800 bg-[#090d16]' : 'border-slate-200 bg-white'}`}>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isUsersTab = item.path === '/admin/users';
                const isActive = pathname === item.path || (isUsersTab && pathname.startsWith('/admin/portfolios'));

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-2.5 px-3 text-sm font-bold rounded-lg transition-colors ${isActive
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {/* Search Input for Mobile */}
            <div className="relative pt-2 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pt-2 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                placeholder="Press Enter to search..."
                className={`w-full h-10 rounded-lg pl-10 pr-4 text-sm focus:outline-none transition-all ${isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 lg:px-8 lg:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className={`border-t transition-all duration-300 ${isDark ? 'bg-[#090d16] border-slate-900 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Student<span className="text-cyan-500">Hub</span> Admin
            </div>
            <p className="text-[11px]">© 2026 StudentHub Marketplace. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold">
            <Link href="#" className={`transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}>Terms</Link>
            <Link href="#" className={`transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}>Privacy</Link>
            <Link href="#" className={`transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}>Support</Link>
            <Link href="#" className={`transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}>System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}