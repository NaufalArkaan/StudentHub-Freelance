'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Plus, Edit, Loader2, Inbox, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Definisi tipe data untuk Order
type OrderItem = {
  id: string;
  status: string;
  price: number;
  created_at: string;
  service: { title: string };
  client: { full_name: string; avatar_url: string } | null;
};

export default function FreelancerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  // State Custom Modals
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fungsi helper notifikasi sukses
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // 2. Fetch Services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('freelancer_id', user.id)
          .order('created_at', { ascending: false });

        setServices(servicesData || []);

        // 3. Fetch Orders (METODE AMAN TANPA JOIN LANGSUNG KE PROFILES)
        const myServiceIds = servicesData?.map(s => s.id) || [];

        if (myServiceIds.length > 0) {
          // Ambil order beserta client_id-nya saja
          const { data: rawOrders, error: ordersError } = await supabase
            .from('orders')
            .select(`
              id,
              status,
              price,
              created_at,
              client_id,
              service:services (title)
            `)
            .in('service_id', myServiceIds)
            .order('created_at', { ascending: false });

          if (ordersError) {
            console.error("Error Supabase Orders:", ordersError);
          }

          if (rawOrders && rawOrders.length > 0) {
            // Ambil data profil klien secara terpisah (mengakali error Foreign Key)
            const clientIds = [...new Set(rawOrders.map((o: any) => o.client_id).filter(Boolean))];
            let profileMap = new Map();

            if (clientIds.length > 0) {
              const { data: clientProfiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', clientIds);

              profileMap = new Map(clientProfiles?.map(p => [p.id, p]));
            }

            // Gabungkan datanya
            const formattedOrders = rawOrders.map((o: any) => {
              const clientProfile = profileMap.get(o.client_id);
              return {
                id: o.id,
                status: (o.status || 'pending').toLowerCase().trim(),
                price: Number(o.price) || 0,
                created_at: o.created_at,
                service: Array.isArray(o.service) ? o.service[0] : o.service,
                client: clientProfile ? {
                  full_name: clientProfile.full_name,
                  avatar_url: clientProfile.avatar_url
                } : null,
              };
            });
            setOrders(formattedOrders);
          }
        }
      } catch (error) {
        console.error("Gagal menarik data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase, router]);

  // FUNGSI UNTUK MENGAKTIFKAN/MENONAKTIFKAN LAYANAN DENGAN CUSTOM ALERTS
  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      // Optimistic Update
      setServices(services.map(s => s.id === serviceId ? { ...s, is_active: !currentStatus } : s));

      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;

      showSuccess(`Layanan berhasil di${!currentStatus ? 'aktifkan' : 'non-aktifkan'}!`);
    } catch (error: any) {
      console.error("Gagal mengubah status layanan:", error);
      setErrorMsg("Gagal mengubah status layanan. " + (error.message || "Silakan coba lagi."));
      // Rollback jika error
      setServices(services.map(s => s.id === serviceId ? { ...s, is_active: currentStatus } : s));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col gap-4 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
        <p className="text-sm font-medium text-slate-500">Membaca data server...</p>
      </div>
    );
  }

  // --- LOGIKA STATISTIK ---
  const activeOrdersCount = orders.filter(o => o.status === 'in_progress' || o.status === 'pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const thisMonthEarnings = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0);

  // Memisahkan order berdasarkan status (maksimal 3 item per papan)
  const incomingOrders = orders.filter(o => o.status === 'pending').slice(0, 3);
  const inProgressOrders = orders.filter(o => o.status === 'in_progress').slice(0, 3);
  const completedOrdersList = orders.filter(o => o.status === 'completed').slice(0, 3);

  // Logika Foto Profil (Fallback berlapis)
  const avatarUrl = profile?.avatar_url || (profile?.nim
    ? `https://krs.umm.ac.id/Poto/${profile.nim.slice(0, 4)}/${profile.nim}.JPG`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id || 'Fallback'}`);

  // Tampilkan maksimal 2 layanan di Dashboard
  const displayServices = services.slice(0, 2);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header Halaman */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Freelancer Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Manage your services, track orders, and update your professional profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- PERFORMANCE OVERVIEW --- */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10">
                <TrendingUp className="h-6 w-6 text-cyan-500" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Performance Overview</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors hover:border-cyan-200 dark:hover:border-cyan-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Active Orders</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{activeOrdersCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Completed</p>
                <p className="text-4xl font-black text-emerald-500 dark:text-emerald-400">{completedOrdersCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors hover:border-fuchsia-200 dark:hover:border-fuchsia-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Total Earnings</p>
                <p className="text-3xl sm:text-4xl font-black text-fuchsia-500 dark:text-fuchsia-400 truncate" title={`Rp ${thisMonthEarnings.toLocaleString('id-ID')}`}>
                  Rp {(thisMonthEarnings / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>

          {/* --- PROFILE SUMMARY --- */}
          <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-950/20 dark:to-[#1f2937]"></div>

            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-[#1f2937] p-1 mb-4 relative z-10 shadow-lg bg-white dark:bg-[#1f2937]">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 pointer-events-none"></div>
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-slate-100 dark:bg-slate-800"
              />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white relative z-10">{profile?.full_name || 'Your Name'}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 font-bold tracking-wide relative z-10">
              {profile?.nim || '-'} • {profile?.program_study || 'Student'}
            </p>
            <Link href="/freelancer/profile" className="mt-auto pt-6 w-full relative z-10">
              <button className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>

        {/* --- MY SERVICES --- */}
        <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <Edit className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Active Services</h2>
            </div>
            <Link href="/freelancer/services/new">
              <button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer">
                <Plus className="h-4 w-4" /> Add New Service
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayServices.length > 0 ? displayServices.map((service: any) => (
              <div key={service.id} className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between group hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors cursor-pointer">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleServiceStatus(service.id, service.is_active);
                      }}
                      className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${service.is_active ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      title={service.is_active ? "Nonaktifkan Layanan" : "Aktifkan Layanan"}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${service.is_active ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md shrink-0">
                      Rp {(service.price / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mt-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {service.title}
                  </h3>
                </div>
              </div>
            )) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You haven&apos;t created any services yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- ORDER BOARD SUMMARY --- */}
        <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <Inbox className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Order Board</h2>
            </div>
            <Link href="/freelancer/orders" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 transition-colors">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUMN: PENDING */}
            <div className="bg-slate-50/50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">Permintaan Masuk</h3>
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[11px] flex items-center justify-center font-bold">
                  {incomingOrders.length}
                </span>
              </div>
              <div className="space-y-3 flex-grow">
                {incomingOrders.map((order: OrderItem) => (
                  <div key={order.id} className="bg-white dark:bg-[#1f2937] rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-300 dark:hover:border-amber-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded">PENDING</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rp {(order.price / 1000).toFixed(0)}k</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 leading-snug">{order.service?.title}</h4>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <img src={order.client?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.id}`} alt="Client" className="w-6 h-6 rounded-full object-cover bg-slate-100 dark:bg-slate-800" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{order.client?.full_name || 'Anonymous'}</p>
                    </div>
                  </div>
                ))}
                {incomingOrders.length === 0 && (
                  <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-medium text-slate-400">Belum ada antrean.</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN: IN PROGRESS */}
            <div className="bg-slate-50/50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">Sedang Dikerjakan</h3>
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[11px] flex items-center justify-center font-bold">
                  {inProgressOrders.length}
                </span>
              </div>
              <div className="space-y-3 flex-grow">
                {inProgressOrders.map((order: OrderItem) => (
                  <div key={order.id} className="bg-white dark:bg-[#1f2937] rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">PROSES</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rp {(order.price / 1000).toFixed(0)}k</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 leading-snug">{order.service?.title}</h4>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <img src={order.client?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.id}`} alt="Client" className="w-6 h-6 rounded-full object-cover bg-slate-100 dark:bg-slate-800" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{order.client?.full_name || 'Anonymous'}</p>
                    </div>
                  </div>
                ))}
                {inProgressOrders.length === 0 && (
                  <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-medium text-slate-400">Belum ada pesanan aktif.</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN: COMPLETED */}
            <div className="bg-slate-50/50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="text-xs font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase">Telah Selesai</h3>
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[11px] flex items-center justify-center font-bold">
                  {completedOrdersList.length}
                </span>
              </div>
              <div className="space-y-3 flex-grow">
                {completedOrdersList.map((order: OrderItem) => (
                  <div key={order.id} className="bg-white dark:bg-[#1f2937] rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">SELESAI</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rp {(order.price / 1000).toFixed(0)}k</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 leading-snug">{order.service?.title}</h4>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <img src={order.client?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.id}`} alt="Client" className="w-6 h-6 rounded-full object-cover bg-slate-100 dark:bg-slate-800 opacity-80" />
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{order.client?.full_name || 'Anonymous'}</p>
                    </div>
                  </div>
                ))}
                {completedOrdersList.length === 0 && (
                  <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-medium text-slate-400">Belum ada histori.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* KUMPULAN CUSTOM MODALS */}
      {/* ========================================== */}

      {/* 1. SUCCESS MODAL */}
      {successMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-center text-2xl font-black text-slate-900 dark:text-white mb-2">
              Berhasil!
            </h2>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {successMsg}
            </p>
          </div>
        </div>
      )}

      {/* 2. ERROR MODAL */}
      {errorMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white">Terjadi Kesalahan</h3>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {errorMsg}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button onClick={() => setErrorMsg('')} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}