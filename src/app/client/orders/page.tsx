/* eslint-disable react/no-unescaped-entities */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { OrderStats } from "./components/order-stats";
import { OrdersTable } from "./components/orders-table";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Compass, AlertCircle, X } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [activeOrders, setActiveOrders] = React.useState(0);
  const [completedOrders, setCompletedOrders] = React.useState(0);
  const [totalSpent, setTotalSpent] = React.useState(0);

  // STATE UNTUK CUSTOM ALERT MODAL
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");

  React.useEffect(() => {
    const fetchRealOrders = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sesi login tidak ditemukan");

        // 1. Ambil data pesanan (Orders)
        const { data: ordersData, error: ordersError } = await supabase
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
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // 2. Ambil profil freelancer
        const freelancerIds = [...new Set(ordersData.map((o: any) => o.service?.freelancer_id).filter(Boolean))];
        let profileMap = new Map();

        if (freelancerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', freelancerIds);
          profileMap = new Map(profiles?.map(p => [p.id, p]));
        }

        // 3. RADAR REVIEW: Cek order mana saja yang sudah pernah di-review
        const orderIds = ordersData.map((o: any) => o.id);
        let reviewedOrderIds = new Set();

        if (orderIds.length > 0) {
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('order_id')
            .in('order_id', orderIds);

          if (reviewsData) {
            reviewedOrderIds = new Set(reviewsData.map(r => r.order_id));
          }
        }

        let activeCount = 0;
        let completedCount = 0;
        let spentCount = 0;

        const formattedOrders = ordersData.map((order: any) => {
          const profile = profileMap.get(order.service?.freelancer_id);
          const price = order.price || 0;

          const rawStatus = (order.status || 'pending').toLowerCase();
          const validStatus = ["pending", "in_progress", "completed", "cancelled"].includes(rawStatus)
            ? rawStatus
            : "pending";

          // Kalkulasi Statistik
          if (validStatus === 'pending' || validStatus === 'in_progress') activeCount++;
          else if (validStatus === 'completed') completedCount++;
          if (validStatus !== 'cancelled') spentCount += price;

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

          // 👇 LOGIKA ACTION BUTTON YANG SUDAH PINTAR 👇
          let actionType: 'solid' | 'outline' | 'disabled' | undefined = undefined;
          let actionLabel: string | undefined = undefined;

          const isAlreadyReviewed = reviewedOrderIds.has(order.id);

          if (validStatus === 'in_progress') {
            actionType = 'outline';
            actionLabel = 'Chat';
          } else if (validStatus === 'completed') {
            if (isAlreadyReviewed) {
              actionType = 'disabled';
              actionLabel = 'Reviewed';
            } else {
              actionType = 'solid';
              actionLabel = 'Review';
            }
          }

          return {
            id: order.id,
            serviceId: order.service?.id || 'unknown',
            serviceName: order.service?.title || 'Layanan Tanpa Nama',
            serviceCategory: order.service?.category?.name || 'General',
            serviceImage: `https://api.dicebear.com/7.x/shapes/svg?seed=${order.id}`,
            freelancerId: order.service?.freelancer_id || 'unknown',
            freelancerName: profile?.full_name || 'Freelancer',
            freelancerAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.service?.freelancer_id}`,
            status: validStatus,
            totalPrice: price,
            createdAt: formattedDate,
            reviewed: isAlreadyReviewed,
            actionType,
            actionLabel
          };
        });

        setOrders(formattedOrders);
        setActiveOrders(activeCount);
        setCompletedOrders(completedCount);
        setTotalSpent(spentCount);

      } catch (err: any) {
        console.error("Gagal memuat orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRealOrders();
  }, [supabase]);

  const handleChatClick = (orderId: string) => {
    router.push(`/client/inbox?orderId=${orderId}`);
  };

  const handleReviewClick = (orderId: string) => {
    // Pengaman ekstra: Tampilkan Custom Alert jika sudah di-review
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && targetOrder.reviewed) {
      setAlertMessage("Anda sudah pernah memberikan ulasan untuk pesanan ini sebelumnya.");
      setShowAlert(true);
      return;
    }

    router.push(`/client/orders/${orderId}/review`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
        <p className="text-slate-500 font-medium">Memuat riwayat pesanan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12 p-4 md:p-8">
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-500">
          <p>Failed to load orders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-sm">
            Manage your active collaborations and view history. Track progress on services you've purchased from fellow campus talent.
          </p>
        </div>

        <OrderStats
          activeOrders={activeOrders}
          completedOrders={completedOrders}
          totalSpent={totalSpent}
        />

        {orders.length > 0 ? (
          <OrdersTable
            orders={orders}
            onChatClick={handleChatClick}
            onReviewClick={handleReviewClick}
          />
        ) : (
          <div className="text-center py-20 mt-10 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Compass className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Pesanan</h3>
            <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-md mx-auto">
              Anda belum memesan layanan apapun. Mulai jelajahi talenta mahasiswa di kampus Anda sekarang.
            </p>
            <button
              onClick={() => router.push('/client/explore')}
              className="mt-8 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Cari Layanan
            </button>
          </div>
        )}
      </div>

      {/* CUSTOM ALERT MODAL */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white">Pemberitahuan</h3>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Modal */}
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {alertMessage}
              </p>
            </div>

            {/* Aksi Modal */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setShowAlert(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}