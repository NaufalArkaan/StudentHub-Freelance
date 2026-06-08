'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass, MoreVertical, Star, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/client/explore?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/client/explore');
    }
  };

  // =========================================================================
  // [TODO: DATABASE] DUMMY DATA AREA
  // Nanti saat integrasi Supabase, hapus data statis di bawah ini dan 
  // ganti menggunakan React.useState() dan React.useEffect() untuk fetch data.
  // =========================================================================

  const dummyRecentOrders = [
    {
      id: 'ord-1',
      serviceName: 'Web App Bug Fix',
      category: 'Technical Support',
      freelancerName: 'Budi W.',
      freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi', // Bisa ganti URL foto asli nanti
      date: 'Oct 24, 2026',
      status: 'In Progress',
      actionLabel: 'Chat',
      actionType: 'outline', // 'outline' | 'solid' | 'disabled'
    },
    {
      id: 'ord-2',
      serviceName: 'Logo Redesign',
      category: 'Graphic Design',
      freelancerName: 'Alex R.',
      freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      date: 'Oct 20, 2026',
      status: 'Completed',
      actionLabel: 'Leave Review',
      actionType: 'solid',
    },
    {
      id: 'ord-3',
      serviceName: 'Calculus II Exam Prep',
      category: 'Tutoring',
      freelancerName: 'Sarah J.',
      freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      date: 'Oct 15, 2026',
      status: 'Completed',
      actionLabel: 'Reviewed',
      actionType: 'disabled',
    },
  ];

  // =========================================================================
  // AKHIR AREA DUMMY DATA
  // =========================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">

      {/* 1. HERO SECTION */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-[#f8fafc] leading-tight transition-colors">
          Find Campus Talent Instantly
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Connect with skilled peers for tutoring, design, coding, and more. A marketplace built exclusively for the student ecosystem.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto flex items-center mt-8">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="What service do you need?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-full border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 dark:border-slate-800 dark:bg-[#111827] dark:text-white shadow-sm transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-bold px-6 rounded-full text-sm transition-colors duration-200"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Filters:</span>
          {['Design', 'Coding', 'Tutoring', 'Writing', 'Research'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => router.push(`/client/explore?category=${filter}`)}
              className="px-5 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors duration-200 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* 2. TRENDING SERVICES SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Trending Services</h2>
          <button
            onClick={() => router.push('/client/explore')}
            className="text-xs sm:text-sm font-semibold text-cyan-600 dark:text-slate-300 hover:dark:text-white flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Card 1: UI/UX Design (Besar/Utama) */}
          <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between p-6 shadow-sm group cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-700">
            {/* Background Glow Effect */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl rounded-full pointer-events-none"></div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  UI/UX Design
                </span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-500">
                  <Star className="h-3.5 w-3.5 fill-cyan-500 text-cyan-500" />
                  <span>4.9</span>
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Complete App Design Concept
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                I will design a modern, user-friendly interface for your mobile or web application using Figma. Includes clickable prototype.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between relative z-10 pt-4">
              <div className="flex items-center gap-3">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alex R.</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Informatics Eng.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Starting from</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Rp 250.000</p>
              </div>
            </div>
          </div>

          {/* Card 2: Tutoring */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between p-6 shadow-sm cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Tutoring
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Calculus II Exam Prep
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Intensive study session focusing on integration and series. Guaranteed grade improvement.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                  So
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sarah o.</h4>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Rp 50.000<span className="text-[10px] text-slate-400 font-normal">/hr</span></p>
            </div>
          </div>

          {/* Card 3: Coding */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between p-6 shadow-sm cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Coding
                </span>
                <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-500">
                  <Star className="h-3.5 w-3.5 fill-cyan-500 text-cyan-500" />
                  <span>5.0</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Python Data Scripting
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Custom scripts to clean and analyze your lab data for research projects.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                  B
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Budi W.</h4>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Rp 150.000</p>
            </div>
          </div>

          {/* Card 4: Explore More (Dashed) */}
          <div
            onClick={() => router.push('/client/explore')}
            className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Compass className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Explore All Categories</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Browse hundreds of services offered by verified students across all departments.
            </p>
          </div>

        </div>
      </section>

      {/* 3. RECENT ORDERS SECTION */}
      <section className="space-y-6" id="orders">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Recent Orders</h2>
          <button className="text-xs sm:text-sm font-semibold text-cyan-600 dark:text-slate-300 hover:dark:text-white flex items-center gap-1 transition-colors">
            View All Orders <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-500 uppercase">
                <th className="py-5 px-6">SERVICE NAME</th>
                <th className="py-5 px-6">FREELANCER</th>
                <th className="py-5 px-6">DATE</th>
                <th className="py-5 px-6">STATUS</th>
                <th className="py-5 px-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
              {dummyRecentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">

                  {/* Service Name & Image Placeholder */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <ImageIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{order.serviceName}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{order.category}</p>
                      </div>
                    </div>
                  </td>

                  {/* Freelancer Avatar & Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={order.freelancerAvatar} alt={order.freelancerName} className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <span className="font-semibold text-slate-900 dark:text-slate-200 text-sm">{order.freelancerName}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">
                    {order.date}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${order.status === 'In Progress'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-4">
                      {order.actionType === 'solid' && (
                        <button className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-bold text-[11px] transition-colors w-28 text-center">
                          {order.actionLabel}
                        </button>
                      )}
                      {order.actionType === 'outline' && (
                        <button className="px-5 py-2 rounded-lg border border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-bold text-[11px] transition-colors w-28 text-center">
                          {order.actionLabel}
                        </button>
                      )}
                      {order.actionType === 'disabled' && (
                        <button disabled className="px-5 py-2 rounded-lg bg-transparent text-slate-400 dark:text-slate-600 font-bold text-[11px] w-28 text-center cursor-not-allowed">
                          {order.actionLabel}
                        </button>
                      )}
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}