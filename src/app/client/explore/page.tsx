'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, Heart, Star, Terminal, Layout, Cpu, Smartphone, Server, FileText } from 'lucide-react';

export default function ClientExplore() {
  const router = useRouter();

  // 1. STATES
  const [favorites, setFavorites] = React.useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = React.useState(1);

  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const toggleDropdown = (menu: string) => setOpenDropdown(prev => prev === menu ? null : menu);

  const [activeTech, setActiveTech] = React.useState('All');
  const [activeDelivery, setActiveDelivery] = React.useState('Any Time');
  const [activeBudget, setActiveBudget] = React.useState('Any Budget');
  const [activeSort, setActiveSort] = React.useState('Recommended');

  const deliveryOptions = ['Any Time', '24 Hours', 'Up to 3 Days', 'Up to 7 Days'];
  const budgetOptions = ['Any Budget', 'Under Rp 50k', 'Rp 50k - Rp 150k', 'Over Rp 150k'];
  const sortOptions = ['Recommended', 'Highest Rated', 'Lowest Price'];

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 2. DUMMY DATA
  const services = [
    {
      id: 1,
      title: 'Jasa Debugging Java & Swing GUI',
      freelancerName: 'Robi A.',
      freelancerAvatar: 'R',
      rating: 4.9,
      price: 'Rp 100.000',
      priceNum: 100000,
      icon: Terminal,
      bgGradient: 'from-amber-500/20 to-orange-600/10',
      tag: 'Java',
    },
    {
      id: 2,
      title: 'Slicing UI React & Tailwind CSS',
      freelancerName: 'Fina A.',
      freelancerAvatar: 'F',
      rating: 5.0,
      price: 'Rp 150.000',
      priceNum: 150000,
      icon: Layout,
      bgGradient: 'from-cyan-500/20 to-blue-600/10',
      tag: 'React',
    },
    {
      id: 3,
      title: 'Pembuatan Model Machine Learning',
      freelancerName: 'Alex M.',
      freelancerAvatar: 'A',
      rating: 4.8,
      price: 'Rp 200.000',
      priceNum: 200000,
      icon: Cpu,
      bgGradient: 'from-purple-500/20 to-indigo-600/10',
      tag: 'AI/ML',
    },
    {
      id: 4,
      title: 'Cross-Platform Flutter Development',
      freelancerName: 'Kevin J.',
      freelancerAvatar: 'K',
      rating: 4.9,
      price: 'Rp 120.000',
      priceNum: 120000,
      icon: Smartphone,
      bgGradient: 'from-pink-500/20 to-rose-600/10',
      tag: 'Mobile',
    },
    {
      id: 5,
      title: 'API Development with Node.js',
      freelancerName: 'Dika S.',
      freelancerAvatar: 'D',
      rating: 4.7,
      price: 'Rp 90.000',
      priceNum: 90000,
      icon: Server,
      bgGradient: 'from-emerald-500/20 to-teal-600/10',
      tag: 'Backend',
    },
    {
      id: 6,
      title: 'Python Scripting & Automation Tools',
      freelancerName: 'Sarah L.',
      freelancerAvatar: 'S',
      rating: 5.0,
      price: 'Rp 80.000',
      priceNum: 80000,
      icon: FileText,
      bgGradient: 'from-blue-500/20 to-cyan-600/10',
      tag: 'Python',
    },
  ];

  // 3. LOGIKA FILTER & SORTING
  const techStacks = ['All', ...Array.from(new Set(services.map((s) => s.tag)))];

  let processedServices = services.filter((service) => {
    if (activeTech !== 'All' && service.tag !== activeTech) return false;
    return true;
  });

  // Logika Sorting yang benar-benar berfungsi
  if (activeSort === 'Highest Rated') {
    processedServices.sort((a, b) => b.rating - a.rating);
  } else if (activeSort === 'Lowest Price') {
    processedServices.sort((a, b) => a.priceNum - b.priceNum);
  }

  // 4. KOMPONEN UI
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 min-h-screen">

      {/* Header Section */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/client/dashboard')}
          className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
            Programming & Tech Services
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Connect with skilled student developers for everything from quick bug fixes to full-stack applications and AI models.
          </p>
        </div>
      </div>

      {/* Filter Toolbar Terpadu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111827] shadow-sm relative z-20">

        <div className="flex flex-wrap items-center gap-3">

          {/* Tech Stack Dropdown */}
          <div className="relative">
            <button onClick={() => toggleDropdown('tech')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f2937] dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
              Tech Stack: <span className="text-cyan-600 dark:text-cyan-400">{activeTech}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'tech' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'tech' && (
              <div className="absolute top-full left-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
                {techStacks.map((tech) => (
                  <button key={tech} onClick={() => { setActiveTech(tech); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeTech === tech ? 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                    {tech}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Time Dropdown */}
          <div className="relative">
            <button onClick={() => toggleDropdown('delivery')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f2937] dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
              Delivery: <span className="font-normal">{activeDelivery}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'delivery' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'delivery' && (
              <div className="absolute top-full left-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
                {deliveryOptions.map((opt) => (
                  <button key={opt} onClick={() => { setActiveDelivery(opt); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeDelivery === opt ? 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Budget Dropdown */}
          <div className="relative">
            <button onClick={() => toggleDropdown('budget')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1f2937] dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
              Budget: <span className="font-normal">{activeBudget}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'budget' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'budget' && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
                {budgetOptions.map((opt) => (
                  <button key={opt} onClick={() => { setActiveBudget(opt); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeBudget === opt ? 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sort Section */}
        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 relative">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sort By:</span>
          <button onClick={() => toggleDropdown('sort')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-200 transition-colors">
            {activeSort} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'sort' && (
            <div className="absolute top-full right-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-lg py-2 z-30">
              {sortOptions.map((opt) => (
                <button key={opt} onClick={() => { setActiveSort(opt); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${activeSort === opt ? 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid of Cards */}
      {processedServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {processedServices.map((service) => {
            const ServiceIcon = service.icon;
            const isFav = !!favorites[service.id];

            return (
              <div key={service.id} className="group rounded-2xl border border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#111827] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md dark:shadow-none">

                {/* Image Area */}
                <div className={`relative h-44 bg-gradient-to-br ${service.bgGradient} flex items-center justify-center border-b border-slate-100 dark:border-slate-800`}>
                  <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 mix-blend-overlay" />
                  <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white dark:border-slate-700/50 flex flex-col items-center gap-2 text-slate-900 dark:text-slate-200 z-10 shadow-sm">
                    <ServiceIcon className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">{service.tag}</span>
                  </div>
                  <button onClick={() => toggleFavorite(service.id)} className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 shadow-sm ${isFav ? 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-500/20 dark:border-red-500/30' : 'bg-white/90 text-slate-400 hover:text-red-500 border border-slate-200 dark:bg-slate-900/80 dark:text-slate-500 dark:hover:text-white dark:border-slate-700'}`}>
                    <Heart className={`h-4.5 w-4.5 transition-transform hover:scale-110 ${isFav ? 'fill-red-500' : ''}`} />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-[10px] border border-slate-200 dark:border-slate-700">
                          {service.freelancerAvatar}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{service.freelancerName}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500" />
                        <span>{service.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                      {service.title}
                    </h3>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-semibold">Starting From</p>
                      <p className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">{service.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-transparent">
          <Terminal className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tidak ada layanan ditemukan</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Coba sesuaikan pilihan filter di atas.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-12">
        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {[1, 2, 3].map((page) => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-colors shadow-sm ${currentPage === page ? 'bg-cyan-500 text-slate-900 border border-cyan-400' : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white'}`}>
            {page}
          </button>
        ))}
        <span className="text-slate-500 dark:text-slate-400 px-1 text-sm font-bold">...</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#111827] dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors">
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>
    </div>
  );
}