'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Compass, Star, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ClientDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = React.useState('');

  // STATE UNTUK DATA
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(true);

  const [trendingServices, setTrendingServices] = React.useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = React.useState(true);

  // FETCH DATA DARI SUPABASE
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoadingOrders(true);
      setIsLoadingServices(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // --- A. FETCH RECENT ORDERS ---
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            price,
            service:services (
              title,
              freelancer_id,
              category:categories (
                name
              )
            )
          `)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) console.error("Error ambil orders:", ordersError);

        // --- B. FETCH TRENDING SERVICES ---
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (servicesError) console.error("Error ambil services:", servicesError);

        const orderFreelancerIds = orders ? orders.map((o: any) => o.service?.freelancer_id).filter(Boolean) : [];
        const serviceFreelancerIds = services ? services.map((s: any) => s.freelancer_id).filter(Boolean) : [];
        const allFreelancerIds = [...Array.from(new Set([...orderFreelancerIds, ...serviceFreelancerIds]))];

        let profileMap = new Map();
        if (allFreelancerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', allFreelancerIds);
          profileMap = new Map(profiles?.map(p => [p.id, p]));
        }

        // --- FORMAT ORDERS ---
        if (orders) {
          const formattedOrders = orders.map((order: any) => {
            const freelancerId = order.service?.freelancer_id;
            const profile = profileMap.get(freelancerId);

            const rawStatus = (order.status || 'pending').toLowerCase();
            const validStatus = ["pending", "in_progress", "completed", "cancelled"].includes(rawStatus)
              ? rawStatus
              : "pending";

            // Format Status
            let displayStatus = 'Pending';
            if (validStatus === 'in_progress') {
              displayStatus = 'In Progress';
            } else if (validStatus === 'completed') {
              displayStatus = 'Completed';
            } else if (validStatus === 'cancelled') {
              displayStatus = 'Cancelled';
            }

            // Format Tanggal
            let formattedDate = 'Unknown Date';
            if (order.created_at) {
              try {
                const dateOnly = order.created_at.split(' ')[0].split('T')[0];
                const [year, month, day] = dateOnly.split('-');
                const parsedDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
                if (!isNaN(parsedDate.getTime())) {
                  formattedDate = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
              } catch {
                formattedDate = order.created_at.split(' ')[0] || 'Invalid Date';
              }
            }

            return {
              id: order.id,
              serviceName: order.service?.title || 'Layanan Tanpa Nama',
              category: order.service?.category?.name || 'General',
              serviceImage: `https://api.dicebear.com/7.x/shapes/svg?seed=${order.id}`, // Gambar abstrak untuk service
              freelancerName: profile?.full_name || 'Freelancer',
              freelancerAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${freelancerId}`,
              date: formattedDate,
              status: displayStatus
            };
          });
          setRecentOrders(formattedOrders);
        }

        // --- FORMAT SERVICES ---
        if (services) {
          const formattedServices = services.map((service: any) => {
            const profile = profileMap.get(service.freelancer_id);
            return {
              id: service.id,
              title: service.title || service.name,
              category: service.tag || 'General',
              description: service.description,
              price: service.price || 0,
              freelancerName: profile?.full_name || 'Mahasiswa',
              freelancerAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${service.freelancer_id}`,
              rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1)
            };
          });
          setTrendingServices(formattedServices);
        }
      } catch (err) {
        console.error("Fatal Error Dashboard:", err);
      } finally {
        setIsLoadingOrders(false);
        setIsLoadingServices(false);
      }
    };

    fetchDashboardData();
  }, [supabase]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20 relative">

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
            className="w-full pl-14 pr-32 py-4 sm:py-5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 shadow-lg shadow-slate-200/40 dark:shadow-none transition-all duration-300 text-base sm:text-lg"
          />
          <button type="submit" className="absolute right-2.5 top-2.5 bottom-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-6 sm:px-8 rounded-full text-sm transition-all duration-200 shadow-md hover:shadow-cyan-500/25">
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
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-cyan-700/50 dark:hover:text-cyan-400 dark:hover:bg-cyan-950/30 transition-all duration-200"
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
          <button onClick={() => router.push('/client/explore')} className="group text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-2 transition-colors">
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingServices ? (
            <div className="md:col-span-3 xl:col-span-4 py-12 flex justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : trendingServices.length === 0 ? (
            <div className="md:col-span-3 xl:col-span-4 py-12 flex justify-center text-slate-500 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              Belum ada layanan yang tersedia di platform ini.
            </div>
          ) : (
            trendingServices.map((service, index) => {
              const isLarge = index === 0;
              return (
                <div
                  key={service.id}
                  onClick={() => router.push(`/client/service/${service.id}`)}
                  className={`${isLarge ? 'md:col-span-2 p-8' : 'p-6'} relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between shadow-sm group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-cyan-200 dark:hover:border-slate-700`}
                >
                  {isLarge && <div className="absolute right-0 top-0 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-500/10 blur-3xl rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>}

                  <div className={`space-y-${isLarge ? '5' : '4'} relative z-10`}>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {service.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>{service.rating}</span>
                      </div>
                    </div>
                    <h3 className={`${isLarge ? 'text-3xl sm:text-4xl' : 'text-xl'} font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2`}>
                      {service.title}
                    </h3>
                    <p className={`${isLarge ? 'text-sm sm:text-base max-w-md line-clamp-2' : 'text-sm line-clamp-3'} text-slate-500 dark:text-slate-400 leading-relaxed`}>
                      {service.description || 'Layanan dari mahasiswa bertalenta.'}
                    </p>
                  </div>

                  <div className={`mt-${isLarge ? '10' : '8'} flex items-center justify-between relative z-10 pt-${isLarge ? '6' : '5'} border-t border-slate-100 dark:border-slate-800`}>
                    <div className="flex items-center gap-3">
                      <Image
                        src={service.freelancerAvatar}
                        alt="Avatar"
                        width={isLarge ? 48 : 40}
                        height={isLarge ? 48 : 40}
                        unoptimized
                        className={`${isLarge ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-[#111827] shadow-sm object-cover`}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{service.freelancerName}</h4>
                        {isLarge && <p className="text-xs text-slate-500 dark:text-slate-400">Freelancer</p>}
                      </div>
                    </div>
                    <div className={isLarge ? "text-right" : ""}>
                      {isLarge && <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Mulai dari</p>}
                      <p className={`${isLarge ? 'text-lg sm:text-xl' : 'text-base'} font-black text-slate-900 dark:text-white`}>
                        Rp {service.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Card: Explore More */}
          <div
            onClick={() => router.push('/client/explore')}
            className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent flex flex-col items-center justify-center text-center p-8 cursor-pointer group hover:bg-cyan-50 dark:hover:bg-[#111827]/50 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all duration-300 min-h-[250px]"
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

        {/* TABEL BARU YANG SUDAH DI-POLES (RATA TENGAH) */}
        <div className="w-full bg-white dark:bg-[#101826] border border-slate-200 dark:border-cyan-500/10 rounded-3xl overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(6,182,212,0.08)] transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-[#0F172A] text-cyan-600 dark:text-cyan-400 text-xs uppercase border-b border-slate-200 dark:border-cyan-500/10">
                <tr>
                  <th className="px-6 py-5 font-bold tracking-wider">Service Name</th>
                  {/* Diubah jadi text-center */}
                  <th className="px-6 py-5 font-bold tracking-wider text-center">Freelancer</th>
                  <th className="px-6 py-5 font-bold tracking-wider text-center">Date</th>
                  <th className="px-6 py-5 font-bold tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-cyan-500/10">

                {isLoadingOrders ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                        <p>Memuat riwayat pesanan...</p>
                      </div>
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                        <Compass className="w-10 h-10 text-slate-400 opacity-50" />
                        <p>Belum ada pesanan terbaru. Yuk, mulai cari jasa!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-cyan-50 dark:hover:bg-cyan-500/5 transition-all duration-200 group cursor-pointer" onClick={() => router.push('/client/orders')}>

                      {/* SERVICE NAME (Tetap Rata Kiri) */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                            <Image
                              src={order.serviceImage}
                              alt={order.serviceName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {order.serviceName}
                            </div>
                            <div className="text-xs font-medium text-slate-500 dark:text-zinc-500 mt-1">
                              {order.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* FREELANCER (Dibuat Rata Tengah menggunakan justify-center) */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-cyan-500/10">
                            <Image
                              src={order.freelancerAvatar}
                              alt={order.freelancerName}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-zinc-200">
                            {order.freelancerName}
                          </span>
                        </div>
                      </td>

                      {/* DATE (Dibuat Rata Tengah menggunakan justify-center) */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-zinc-400 font-medium">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {order.date}
                        </div>
                      </td>

                      {/* STATUS (Dibuat Rata Tengah) */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${order.status === 'In Progress' || order.status === 'Pending'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                          : order.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${order.status === 'In Progress' || order.status === 'Pending' ? 'bg-blue-500'
                            : order.status === 'Completed' ? 'bg-emerald-500'
                              : 'bg-red-500'
                            }`}></span>
                          {order.status}
                        </span>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}