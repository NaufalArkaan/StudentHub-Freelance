'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Bell,
  Key,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || null);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/35 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-[#090d16]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Logo Brand & Main Links */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white select-none">
                Student<span className="text-blue-500">Hub</span>
              </span>
            </Link>

            {/* Main Desktop Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => {
                // If current pathname is the item path, or if we are inside portfolios page, highlight the "Users" link
                const isUsersTab = item.path === '/admin/users';
                const isActive = pathname === item.path || (isUsersTab && pathname.startsWith('/admin/portfolios'));
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`relative text-[13px] font-semibold transition-colors hover:text-white py-5 leading-none ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#00d8ff] rounded-full shadow-[0_1px_6px_rgba(0,216,255,0.4)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4.5">
            {/* Search Input */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition-all"
              />
            </div>

            {/* Notification Icon */}
            <button className="relative p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            {/* Profile Avatar Icon with Key Symbol inside Cyan Circle */}
            <div className="flex items-center gap-2">
              <div 
                className="relative w-8 h-8 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:border-cyan-400/50 transition-colors"
                title={adminEmail || 'Administrator'}
              >
                <Key className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Log Out */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-all cursor-pointer"
              title="Keluar"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Links */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 pt-2 border-t border-slate-900 bg-[#090d16] space-y-2">
            <nav className="flex flex-col gap-2.5">
              {navItems.map((item) => {
                const isUsersTab = item.path === '/admin/users';
                const isActive = pathname === item.path || (isUsersTab && pathname.startsWith('/admin/portfolios'));
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-2 text-sm font-semibold rounded-md transition-colors ${
                      isActive ? 'text-white px-2.5 bg-slate-900' : 'text-slate-400 hover:text-slate-200'
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
                <Search className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all"
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#090d16]/20 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-base font-bold text-white tracking-tight">StudentHub</span>
            <p className="text-[11px] text-slate-500">© 2026 StudentHub Marketplace. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-semibold">
            <Link href="#" className="hover:text-slate-350 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-350 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-350 transition-colors">Contact</Link>
            <Link href="#" className="hover:text-slate-350 transition-colors">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
