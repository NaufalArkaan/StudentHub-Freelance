"use client";

import { useRouter } from "next/navigation"; // 1. Import useRouter
import { useOrders } from "./hooks/use-orders";
import { OrderStats } from "./components/order-stats";
import { OrdersTable } from "./components/orders-table";

export default function OrdersPage() {
  const router = useRouter(); // 2. Inisialisasi router
  const { orders, loading, error, activeOrders, completedOrders, totalSpent } = useOrders();

  const handleChatClick = (orderId: string) => {
    // 3. Pindah ke halaman inbox (mengirimkan orderId di URL agar tau konteks chatnya)
    router.push(`/client/inbox?orderId=${orderId}`);
  };

  const handleReviewClick = (orderId: string) => {
    // 4. Pindah ke halaman review
    router.push(`/client/orders/${orderId}/review`);
  };

  if (loading) {
    return null; // Will be handled by loading.tsx automatically by Next.js App Router
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12 p-4 md:p-8">
        {/* Support Light/Dark Mode pada Error State */}
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-500">
          <p>Failed to load orders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-10 max-w-2xl">
        {/* Judul sekarang berwarna gelap di Light Mode, putih di Dark Mode */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          My Orders
        </h1>
        {/* Teks deksripsi disesuaikan kontrasnya */}
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
        // Support Light/Dark Mode pada Empty State
        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
          <p className="text-gray-500 dark:text-zinc-400 mb-4">
            You haven't ordered any services yet.
          </p>
        </div>
      )}
    </div>
  );
}