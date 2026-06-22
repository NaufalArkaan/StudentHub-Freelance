'use client';

import * as React from 'react';
import Card from '@/components/ui/Card';
import { FileText, ChevronDown, ChevronLeft, ChevronRight, Loader2, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminOrdersPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    }>
      <OrdersContent />
    </React.Suspense>
  );
}

function OrdersContent() {
  const supabase = createClient();
  const router = useRouter();

  // Tangkap nilai query 'q' dari URL
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').toLowerCase();

  const [statusFilter, setStatusFilter] = React.useState('All');
  const [timeFilter, setTimeFilter] = React.useState('Semua');

  interface OrderItem {
    id: string;
    realId: string;
    date: string;
    createdAtStr: string;
    service: string;
    category: string;
    freelancer: string;
    freelancerInitials: string;
    freelancerBg: string;
    client: string;
    clientInitials: string;
    clientBg: string;
    amount: number;
    status: string;
  }

  const [orders, setOrders] = React.useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const getInitials = (name: string) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const fetchGlobalOrders = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`id, created_at, status, price, client_id, service_id`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        const { data: servicesData } = await supabase.from('services').select('id, title, category_id, freelancer_id');
        const serviceMap = new Map(servicesData?.map(s => [s.id, s]));

        const userIds = [...new Set([...ordersData.map(o => o.client_id), ...servicesData!.map(s => s.freelancer_id)])];
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));

        const freelancerColors = [
          'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
          'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
          'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
          'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
        ];
        const clientColors = [
          'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
          'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/20',
          'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
          'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20'
        ];

        const formattedOrders = ordersData.map((order: {
          id: string;
          created_at: string;
          status: string | null;
          price: number | string | null;
          client_id: string | null;
          service_id: string | null;
        }, index: number) => {
          const service = serviceMap.get(order.service_id);
          const fName = profileMap.get(service?.freelancer_id) || 'Freelancer';
          const cName = profileMap.get(order.client_id) || 'Client';

          return {
            id: `#ORD-${order.id.split('-')[0].toUpperCase()}`,
            realId: order.id,
            date: new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            createdAtStr: order.created_at,
            service: service?.title || 'Layanan Dihapus',
            category: 'GENERAL',
            freelancer: fName,
            freelancerInitials: getInitials(fName),
            freelancerBg: freelancerColors[index % freelancerColors.length],
            client: cName,
            clientInitials: getInitials(cName),
            clientBg: clientColors[index % clientColors.length],
            amount: Number(order.price) || 0,
            status: (order.status || 'pending').toLowerCase()
          };
        });
        setOrders(formattedOrders);
      }
    } catch (err) {
      const errorObj = err as Error;
      console.error(errorObj);
      setError(errorObj.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      fetchGlobalOrders();
    });
  }, [fetchGlobalOrders]);

  const handleViewDetail = (id: string) => {
    router.push(`/admin/orders/${id}`);
  };

  // LOGIKA PENCARIAN & FILTER DIGABUNG
  const filteredOrders = orders.filter((o) => {
    // Filter Status
    let statusMatch = true;
    if (statusFilter !== 'All') {
      if (statusFilter === 'disputed' && o.status === 'cancelled') statusMatch = true;
      else statusMatch = o.status === statusFilter;
    }

    // Filter Waktu
    let timeMatch = true;
    if (timeFilter !== 'Semua' && o.createdAtStr) {
      const orderDate = new Date(o.createdAtStr.replace(' ', 'T'));
      const now = new Date();
      if (timeFilter === 'Bulan Ini') {
        timeMatch = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'Minggu Ini') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        timeMatch = orderDate >= oneWeekAgo;
      }
    }

    // Filter Pencarian (Search Bar)
    let searchMatch = true;
    if (searchQuery) {
      searchMatch = (
        o.id.toLowerCase().includes(searchQuery) ||
        o.service.toLowerCase().includes(searchQuery) ||
        o.freelancer.toLowerCase().includes(searchQuery) ||
        o.client.toLowerCase().includes(searchQuery)
      );
    }

    return statusMatch && timeMatch && searchMatch;
  });

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-500 m-6">
        <h3 className="font-bold text-lg mb-2">Gagal Memuat Pesanan</h3>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-4 opacity-75">
          *Jika Anda melihat error RLS (Row Level Security), pastikan Admin diizinkan melihat semua pesanan di pengaturan Policies Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Global Orders</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau seluruh transaksi aktif, riwayat pesanan, dan selesaikan sengketa transaksi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-cyan-500 dark:focus:border-slate-700 cursor-pointer transition-colors">
              <option value="Semua">Semua Waktu</option>
              <option value="Bulan Ini">Bulan Ini</option>
              <option value="Minggu Ini">Minggu Ini</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 pr-10 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:border-cyan-500 dark:focus:border-slate-700 cursor-pointer transition-colors">
              <option value="All">Semua Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="disputed">Disputed / Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900/30">
                <th className="py-4.5 px-6 font-semibold">ORDER ID & DATE</th>
                <th className="py-4.5 px-6 font-semibold">SERVICE & CATEGORY</th>
                <th className="py-4.5 px-6 font-semibold">FREELANCER</th>
                <th className="py-4.5 px-6 font-semibold">CLIENT</th>
                <th className="py-4.5 px-6 font-semibold">AMOUNT</th>
                <th className="py-4.5 px-6 font-semibold">STATUS</th>
                <th className="py-4.5 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-500" />
                      <p className="text-sm font-medium">Menarik data transaksi dari Supabase...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <Compass className="w-10 h-10 mb-3 opacity-50 text-slate-400" />
                      <p className="text-sm">
                        {searchQuery ? `Pesanan terkait "${searchQuery}" tidak ditemukan.` : 'Tidak ada pesanan yang sesuai dengan filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                    <td className="py-4.5 px-6">
                      <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-white transition-colors">{o.id}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{o.date}</p>
                    </td>

                    <td className="py-4.5 px-6">
                      <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-white transition-colors max-w-xs truncate">{o.service}</p>
                      <span className="inline-block text-[8px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 px-1.5 py-0.5 rounded mt-1 uppercase tracking-wider">
                        {o.category}
                      </span>
                    </td>

                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] select-none border ${o.freelancerBg}`}>
                          {o.freelancerInitials}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{o.freelancer}</span>
                      </div>
                    </td>

                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] select-none border ${o.clientBg}`}>
                          {o.clientInitials}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{o.client}</span>
                      </div>
                    </td>

                    <td className="py-4.5 px-6 font-bold text-cyan-600 dark:text-cyan-400 text-sm">
                      Rp {Number(o.amount).toLocaleString('id-ID')}
                    </td>

                    <td className="py-4.5 px-6">
                      {o.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed
                        </span>
                      )}
                      {(o.status === 'in_progress' || o.status === 'pending') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> In Progress
                        </span>
                      )}
                      {(o.status === 'cancelled' || o.status === 'disputed') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {o.status === 'cancelled' ? 'Cancelled' : 'Disputed'}
                        </span>
                      )}
                    </td>

                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end">
                        <button onClick={() => handleViewDetail(o.realId)} className="p-1.5 rounded text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer" title="Lihat & Kelola Pesanan">
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d16]/30 px-6 py-4.5 transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredOrders.length > 0 ? 1 : 0}</span>-
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredOrders.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{orders.length}</span> Orders
          </p>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer transition-colors" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="w-8 h-8 rounded-md bg-cyan-500 text-white dark:bg-[#00d8ff] dark:text-slate-950 text-xs font-bold flex items-center justify-center shadow-md dark:shadow-[0_1px_6px_rgba(0,216,255,0.4)] transition-all">
              1
            </button>
            <button className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer transition-colors" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}