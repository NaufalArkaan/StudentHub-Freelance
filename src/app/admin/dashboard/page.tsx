'use client';

import * as React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import {
  Users,
  Sparkles,
  ShoppingCart,
  CreditCard,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [isLoading, setIsLoading] = React.useState(true);

  interface DashboardRecentOrder {
    id: string;
    service: string;
    status: string;
  }

  interface DashboardRecentReport {
    id: string;
    name: string;
    initials: string;
    bg: string;
    reason: string;
    action: 'resolved' | 'review';
  }

  const [dashboardData, setDashboardData] = React.useState({
    totalUsers: 0,
    activeServices: 0,
    totalOrders: 0,
    revenue: 0,
    recentOrders: [] as DashboardRecentOrder[],
    recentReports: [] as DashboardRecentReport[]
  });

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        { count: usersCount },
        { count: servicesCount },
        { count: ordersCount },
        { data: revenueData },
        { data: recentOrdersData },
        { data: recentReportsData, error: reportsError }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('price').eq('status', 'completed'),
        supabase.from('orders')
          .select('id, status, service:services(title)')
          .order('created_at', { ascending: false })
          .limit(4),
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(4)
      ]);

      const totalRevenue = revenueData?.reduce((sum, order: { price: number | string }) => sum + (Number(order.price) || 0), 0) || 0;

      const formattedOrders = recentOrdersData ? (recentOrdersData as unknown as { id: string; status: string; service: { title: string } | { title: string }[] | null }[]).map((o) => {
        const serviceData = Array.isArray(o.service) ? o.service[0] : o.service;
        return {
          id: `#ORD-${o.id.split('-')[0].toUpperCase()}`,
          service: serviceData?.title || 'Layanan Dihapus',
          status: (o.status || 'pending').toLowerCase()
        };
      }) : [];

      let formattedReports: DashboardRecentReport[] = [];
      if (!reportsError && recentReportsData && recentReportsData.length > 0) {
        const reporterIds = [...new Set(recentReportsData.map(r => r.reporter_id || r.user_id).filter(Boolean))];
        let profileMap = new Map();

        if (reporterIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('id, full_name');
          profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));
        }

        // PERBAIKAN: Kontras warna disesuaikan untuk Light dan Dark Mode
        const bgColors = [
          'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
          'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
          'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
        ];

        formattedReports = recentReportsData.map((r, i) => {
          const name = profileMap.get(r.reporter_id || r.user_id) || 'Anonim';
          const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          return {
            id: r.id,
            name: name,
            initials: initials,
            bg: bgColors[i % bgColors.length],
            reason: r.reason || r.description || r.subject || 'Menunggu Tinjauan',
            action: r.status === 'resolved' ? 'resolved' : 'review'
          };
        });
      }

      setDashboardData({
        totalUsers: usersCount || 0,
        activeServices: servicesCount || 0,
        totalOrders: ordersCount || 0,
        revenue: totalRevenue,
        recentOrders: formattedOrders,
        recentReports: formattedReports
      });

    } catch (error) {
      console.error("Gagal menarik data dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      fetchDashboardData();
    });
  }, [fetchDashboardData]);

  const formatCompactNumber = (number: number) => {
    if (number >= 1000000) return `Rp ${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `Rp ${(number / 1000).toFixed(1)}K`;
    return `Rp ${number.toLocaleString('id-ID')}`;
  };

  const stats = [
    {
      label: 'TOTAL USERS',
      value: dashboardData.totalUsers.toLocaleString('id-ID'),
      trend: 'Real-time',
      trendType: 'neutral',
      icon: <Users className="h-4.5 w-4.5 text-slate-400" />
    },
    {
      label: 'ACTIVE SERVICES',
      value: dashboardData.activeServices.toLocaleString('id-ID'),
      trend: 'Real-time',
      trendType: 'neutral',
      icon: <Sparkles className="h-4.5 w-4.5 text-slate-400" />
    },
    {
      label: 'TOTAL ORDERS',
      value: dashboardData.totalOrders.toLocaleString('id-ID'),
      trend: 'Real-time',
      trendType: 'neutral',
      icon: <ShoppingCart className="h-4.5 w-4.5 text-slate-400" />
    },
    {
      label: 'REVENUE (COMPLETED)',
      value: formatCompactNumber(dashboardData.revenue),
      trend: 'Real-time',
      trendType: 'up',
      icon: <CreditCard className="h-4.5 w-4.5 text-slate-400" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          High-level telemetry and platform activity for the StudentHub ecosystem.
        </p>
      </div>

      {isLoading ? (
        <div className="w-full flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0c1222]/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Sinkronisasi data langsung dari Supabase...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222]/40 p-5 flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                    {stat.label}
                  </span>
                  {stat.icon}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</span>
                  <span className={`text-[10px] font-bold ${stat.trendType === 'up'
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-500'
                    }`}>
                    {stat.trend}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Orders Card */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222]/40 overflow-hidden flex flex-col shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Orders</h3>
                <Link
                  href="/admin/orders"
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-0.5 transition-colors"
                >
                  View All
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex-grow overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 font-bold uppercase tracking-wider">
                      <th className="py-3 px-5 font-semibold">ORDER ID</th>
                      <th className="py-3 px-5 font-semibold">SERVICE (JASA)</th>
                      <th className="py-3 px-5 font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {dashboardData.recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-500">Belum ada pesanan masuk.</td>
                      </tr>
                    ) : (
                      dashboardData.recentOrders.map((o, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="py-3.5 px-5 font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                            {o.id}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors max-w-[200px] truncate">
                            {o.service}
                          </td>
                          <td className="py-3.5 px-5">
                            {o.status === 'active' || o.status === 'in_progress' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                Active
                              </span>
                            ) : o.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
                                {o.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Reports Card */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222]/40 overflow-hidden flex flex-col shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Reports</h3>
                <Link
                  href="/admin/reports"
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-0.5 transition-colors"
                >
                  Review All
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex-grow overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 font-bold uppercase tracking-wider">
                      <th className="py-3 px-5 font-semibold">USER</th>
                      <th className="py-3 px-5 font-semibold">REASON</th>
                      <th className="py-3 px-5 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                    {dashboardData.recentReports.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-500">Aman! Belum ada laporan masuk.</td>
                      </tr>
                    ) : (
                      dashboardData.recentReports.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] border ${r.bg}`}>
                                {r.initials}
                              </div>
                              <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {r.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 dark:text-slate-350 font-medium">
                            {r.reason}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {r.action === 'review' ? (
                              <button className="h-7 px-3.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer select-none">
                                Review
                              </button>
                            ) : (
                              <button className="h-7 px-3.5 rounded border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-transparent text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-500/15 transition-colors cursor-pointer select-none">
                                Resolved
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </>
      )}
    </div>
  );
}