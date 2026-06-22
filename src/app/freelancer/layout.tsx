/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sun, Moon, LogOut, GraduationCap, User } from 'lucide-react';

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = React.useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // 1. Setup real-time suspension check (once per session/mount)
  React.useEffect(() => {
    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        subscription = supabase
          .channel(`public-users-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`,
            },
            async (payload: any) => {
              if (payload.new && payload.new.status === 'suspended') {
                await supabase.auth.signOut();
                router.refresh();
                router.push('/login?error=suspended');
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error subscribing to suspension status:', err);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [supabase, router]);

  // 2. Check suspension status on route change
  React.useEffect(() => {
    const checkSuspension = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: dbUser, error } = await supabase
          .from('users')
          .select('status')
          .eq('id', user.id)
          .single();

        if (!error && dbUser && dbUser.status === 'suspended') {
          await supabase.auth.signOut();
          router.refresh();
          router.push('/login?error=suspended');
        }
      } catch (err) {
        console.error('Error checking suspension status on route change:', err);
      }
    };

    checkSuspension();
  }, [supabase, router, pathname]);

  // Load tema dari localStorage saat pertama kali mounted
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  // Efek scroll untuk mengecilkan ukuran navbar
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Sinkronisasi status tema ke localStorage
  React.useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Mengambil NIM mahasiswa dari Supabase untuk menampilkan foto profil
  React.useEffect(() => {
    const fetchUserAvatar = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nim')
            .eq('id', user.id)
            .single();

          if (profile?.nim) {
            setAvatarUrl(
              `https://krs.umm.ac.id/Poto/${profile.nim.slice(
                0,
                4
              )}/${profile.nim}.JPG`
            );
          }
        }
      } catch (error) {
        console.error('Error fetching profile avatar:', error);
      }
    };

    fetchUserAvatar();
  }, [supabase]);

  // Fungsi Logout otomatis kembali ke root hometamp
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/');
    }
  };

  // Navigasi Khusus Halaman Freelancer
  const navLinks = [
    { name: 'Dashboard', href: '/freelancer/dashboard' },
    { name: 'My Services', href: '/freelancer/services' },
    { name: 'Orders', href: '/freelancer/orders' },
    { name: 'Inbox', href: '/freelancer/inbox' },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 ${isDark
          ? 'dark bg-[#090d16] text-slate-100'
          : 'bg-slate-50 text-slate-900'
        }`}
    >
      {/* HEADER */}
      <header
        className={`
          sticky top-0 z-50
          backdrop-blur-xl
          border-b
          transition-all duration-500
          relative
          before:absolute
          before:inset-0
          before:bg-gradient-to-r
          before:from-cyan-500/5
          before:via-transparent
          before:to-blue-500/5
          before:pointer-events-none
          ${isDark
            ? isScrolled
              ? 'bg-[#090d16]/70 border-slate-700 shadow-lg shadow-black/20'
              : 'bg-[#090d16]/95 border-slate-800'
            : isScrolled
              ? 'bg-white/70 border-slate-200 shadow-lg shadow-slate-200/50'
              : 'bg-white/95 border-slate-200'
          }
        `}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'
            }`}
        >
          {/* LOGO */}
          <Link
            href="/freelancer/dashboard"
            className="flex items-center gap-3 group"
          >
            <div
              className="
                w-10 h-10
                rounded-xl
                bg-gradient-to-br
                from-blue-500/20
                to-cyan-500/20
                border border-blue-500/20
                flex items-center justify-center
                transition-all duration-300
                group-hover:scale-105
                group-hover:border-cyan-400/50
              "
            >
              <GraduationCap className="h-5 w-5 text-cyan-400" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Student<span className="text-cyan-400">Hub</span>
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative h-full flex items-center text-sm font-semibold transition-all duration-300 ${isActive
                      ? 'text-cyan-400'
                      : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {link.name}

                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0'
                      }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">
            {/* THEME TOGGLE */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${isDark
                  ? 'hover:bg-slate-800 text-slate-300'
                  : 'hover:bg-slate-100 text-slate-600'
                }`}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* AVATAR */}
            <Link
              href="/freelancer/profile"
              className={`
                w-10 h-10
                rounded-full
                overflow-hidden
                border
                cursor-pointer
                transition-all duration-300
                hover:scale-105
                hover:ring-2 hover:ring-cyan-400/50
                block
                ${isDark
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-300 bg-slate-200'
                }
              `}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`
                    w-full h-full
                    flex items-center justify-center
                    ${isDark ? 'text-slate-300' : 'text-slate-600'}
                  `}
                >
                  <User className="h-5 w-5" />
                </div>
              )}
            </Link>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="
                p-2.5
                rounded-xl
                text-red-500
                hover:bg-red-500/10
                hover:scale-105
                transition-all duration-300
              "
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow">{children}</main>

      {/* FOOTER */}
      <footer
        className={`border-t transition-all duration-300 ${isDark
            ? 'bg-[#090d16] border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div
              className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              Student<span className="text-cyan-400">Hub</span>
            </div>

            <p className="text-sm">
              © 2026 StudentHub Marketplace. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Contact
            </Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}