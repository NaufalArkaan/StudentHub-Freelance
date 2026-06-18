/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Menu, X, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';
import { Profile } from '@/types';

interface NavbarProps {
  userProfile?: Profile & { role: string } | null;
}

export function Navbar({ userProfile }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();
  const [avatar, setAvatar] = React.useState("https://api.dicebear.com/7.x/avataaars/svg?seed=StudentHub");

  React.useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem("profile");

      if (!saved) return;

      const profile = JSON.parse(saved);

      const avatarUrl = profile.nim
        ? `https://krs.umm.ac.id/Poto/${profile.nim.slice(
          0,
          4
        )}/${profile.nim}.JPG`
        : "https://api.dicebear.com/7.x/avataaars/svg?seed=StudentHub";

      setAvatar(avatarUrl);
    };

    loadProfile();

    window.addEventListener("profileUpdated", loadProfile);

    return () => {
      window.removeEventListener(
        "profileUpdated",
        loadProfile
      );
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!userProfile) return '/login';
    if (userProfile.role === 'admin') return '/admin/dashboard';
    if (userProfile.role === 'freelancer') return '/freelancer/dashboard';
    return '/client/dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300">
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Student<span className="text-blue-500">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#home" className="text-sm text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/#explore" className="text-sm text-slate-400 hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/#about" className="text-sm text-slate-400 hover:text-white transition-colors">
              About
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {userProfile ? (
              <div className="flex items-center gap-3">

                <Link href="/client/profile">
                  <img src={
                    avatar ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=StudentHub"
                  }
                    alt="Profile"
                    className="
                      h-10
                      w-10
                      rounded-full
                      object-cover
                      border-2
                      border-blue-500
                      cursor-pointer
                      hover:scale-105
                      transition
                    "
                  />
                </Link>
                <Link
                  href="/client/profile"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Profile
                  </Button>
                </Link>
                <Link href={getDashboardLink()}>
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 border-red-500/30 hover:bg-red-500/10 text-red-400">
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <span className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer mr-2">
                    Sign In
                  </span>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-slate-800">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              href="/#home"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              Home
            </Link>
            <Link
              href="/#explore"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              Explore
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              How It Works
            </Link>
            <Link
              href="/#about"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              About
            </Link>

            <div className="pt-4 pb-2 border-t border-slate-800 px-3 flex flex-col gap-3">
              {userProfile ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 border-red-500/30 text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="gradient" size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
