/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sun, Moon, LogOut } from 'lucide-react';
import { Profile } from '@/types';

export function FreelancerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  React.useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data as Profile);
    };

    loadProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/freelancer/dashboard' },
    { name: 'My Services', href: '/freelancer/services' },
    { name: 'Orders', href: '/freelancer/orders' },
    { name: 'Inbox', href: '/freelancer/inbox' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#111827] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/freelancer/dashboard" className="text-xl font-bold text-white tracking-tight">
              Student<span className="text-cyan-400">Hub</span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden sm:flex sm:space-x-8 h-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <Link href="/freelancer/profile" className="flex items-center">
              <img
                src={profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=StudentHub"}
                alt="Profile"
                className="h-8 w-8 rounded-full border border-slate-700 object-cover"
              />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
