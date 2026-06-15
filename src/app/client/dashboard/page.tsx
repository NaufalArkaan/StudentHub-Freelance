'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Compass, MoreVertical, Star, ArrowRight, Image as ImageIcon, Eye, LifeBuoy, Ban } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  // 1. STATE UNTUK DROPDOWN MENU
  const [activeDropdownId, setActiveDropdownId] = React.useState<string | null>(null);

  // KITA HAPUS useEffect document.addEventListener YANG BIKIN BUG!

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/client/explore?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/client/explore');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const dummyRecentOrders = [
    {
      id: 'ord-1',
      serviceName: 'Web App Bug Fix',
      category: 'Technical Support',
      freelancerName: 'Budi W.',
      freelancerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
      date: 'Oct 24, 2026',
      status: 'In Progress',
      actionLabel: 'Chat',
      actionType: 'outline',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20 relative">

      {/* 2. INVISIBLE OVERLAY (PENGGANTI USE-EFFECT) */}
      {/* Jika dropdown terbuka, lapisan bening ini akan muncul memenuhi layar. Klik dimana saja akan menutup dropdown. */}
      {activeDropdownId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdownId(null)}
        />
      )}

      {/* 1. HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto space-y-8 pt-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] transition-colors">
          Find Campus Talent <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Instantly</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Connect with skilled peers for tutoring, design, coding, and more. A marketplace built exclusively for the student ecosystem.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mt-10 group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="What service do you need?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="
              w-full pl-14 pr-32 py-4 sm:py-5 rounded-full 
              border border-slate-200 dark:border-slate-800 
              bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm
              text-slate-900 dark:text-white 
              focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 
              shadow-lg shadow-slate-200/40 dark:shadow-none
              transition-all duration-300 text-base sm:text-lg
            "
          />
          <button
            type="submit"
            className="absolute right-2.5 top-2.5 bottom-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-6 sm:px-8 rounded-full text-sm transition-all duration-200 shadow-md hover:shadow-cyan-500/25"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs sm:text-sm font-medium">
          <span className="text-slate-500 dark:text-slate-400 mr-2">Filters:</span>
          {['Design', 'Coding', 'Tutoring', 'Writing', 'Research'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => router.push(`/client/explore?search=${filter}`)}
              className="
                px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 
                hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50
                dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 
                dark:hover:border-cyan-700/50 dark:hover:text-cyan-400 dark:hover:bg-cyan-950/30
                transition-all duration-200
              "
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* 2. TRENDING SERVICES SECTION */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Trending Services</h2>
          </div>
          <button
            onClick={() => router.push('/client/explore')}
            className="group text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-2 transition-colors"
          >
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Card 1: UI/UX Design */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between p-8 shadow-sm group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-cyan-900/10 hover:border-cyan-200 dark:hover:border-cyan-900">
            <div className="absolute right-0 top-0 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-500/10 blur-3xl rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  UI/UX Design
                </span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>4.9</span>
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Complete App Design Concept
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                I will design a modern, user-friendly interface for your mobile or web application using Figma. Includes clickable prototype.
              </p>
            </div>
            <div className="mt-10 flex items-center justify-between relative z-10 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Image
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                  alt="Avatar"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-[#111827] shadow-sm"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alex R.</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Informatics Eng.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Starting from</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Rp 250.000</p>
              </div>
            </div>
          </div>

          {/* Card 2: Tutoring */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between p-6 shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-cyan-200 dark:hover:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Tutoring
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Calculus II Exam Prep
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                Intensive study session focusing on integration and series. Guaranteed grade improvement.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400 border-2 border-white dark:border-[#111827]">
                  So
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sarah o.</h4>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white">Rp 50.000<span className="text-xs text-slate-400 font-normal">/hr</span></p>
            </div>
          </div>

          {/* Card 3: Coding */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between p-6 shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-cyan-200 dark:hover:border-slate-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Coding
                </span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>5.0</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Python Data Scripting
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                Custom scripts to clean and analyze your lab data for research projects.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 border-2 border-white dark:border-[#111827]">
                  B
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Budi W.</h4>
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white">Rp 150.000</p>
            </div>
          </div>

          {/* Card 4: Explore More */}
          <div
            onClick={() => router.push('/client/explore')}
            className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent flex flex-col items-center justify-center text-center p-8 cursor-pointer group hover:bg-cyan-50 dark:hover:bg-[#111827]/50 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-cyan-500 transition-all duration-300">
              <Compass className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Explore All Categories</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[200px] leading-relaxed">
              Browse hundreds of services offered by verified students across all departments.
            </p>
          </div>

        </div>
      </section>

      {/* 3. RECENT ORDERS SECTION */}
      <section className="space-y-6" id="orders">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Recent Orders</h2>
          </div>
          <button
            onClick={() => router.push('/client/orders')}
            className="group text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-2 transition-colors"
          >
            View All Orders <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <div className="overflow-x-auto pb-32">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-transparent text-xs font-bold tracking-wider text-slate-500 dark:text-slate-500 uppercase">
                  <th className="py-5 px-6 whitespace-nowrap">SERVICE NAME</th>
                  <th className="py-5 px-6 whitespace-nowrap">FREELANCER</th>
                  <th className="py-5 px-6 whitespace-nowrap">DATE</th>
                  <th className="py-5 px-6 whitespace-nowrap">STATUS</th>
                  <th className="py-5 px-6 whitespace-nowrap text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-sm">
                {dummyRecentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">

                    {/* Service Name & Image Placeholder */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                          <ImageIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{order.serviceName}</h4>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{order.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Freelancer Avatar & Name */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Image
                          src={order.freelancerAvatar}
                          alt={order.freelancerName}
                          width={32}
                          height={32}
                          unoptimized
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{order.freelancerName}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                      {order.date}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${order.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${order.status === 'In Progress' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                        {order.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        {order.actionType === 'solid' && (
                          <button
                            onClick={() => router.push(`/client/orders/${order.id}/review`)}
                            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs transition-colors w-32 text-center shadow-sm"
                          >
                            {order.actionLabel}
                          </button>
                        )}
                        {order.actionType === 'outline' && (
                          <button
                            onClick={() => router.push(`/client/inbox?orderId=${order.id}`)}
                            className="px-5 py-2.5 rounded-xl border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 font-bold text-xs transition-colors w-32 text-center"
                          >
                            {order.actionLabel}
                          </button>
                        )}
                        {order.actionType === 'disabled' && (
                          <button disabled className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs w-32 text-center cursor-not-allowed border border-slate-200 dark:border-slate-700">
                            {order.actionLabel}
                          </button>
                        )}

                        {/* 3. TOMBOL TITIK TIGA DENGAN DROPDOWN */}
                        {/* Memberikan z-50 jika sedang aktif agar menang melayang di atas overlay */}
                        <div className={`relative ${activeDropdownId === order.id ? 'z-50' : ''}`}>
                          <button
                            onClick={() => setActiveDropdownId(activeDropdownId === order.id ? null : order.id)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {activeDropdownId === order.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                              <button
                                onClick={() => router.push(`/client/orders/${order.id}`)}
                                className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  alert('Contact Support clicked!');
                                }}
                                className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                <LifeBuoy className="w-4 h-4" />
                                Contact Support
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  alert('Cancel Order clicked!');
                                }}
                                className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-700"
                              >
                                <Ban className="w-4 h-4" />
                                Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                        {/* AKHIR TOMBOL TITIK TIGA */}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}