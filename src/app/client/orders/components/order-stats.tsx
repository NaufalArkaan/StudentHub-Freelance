import React from "react";

interface OrderStatsProps {
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export function OrderStats({
  activeOrders,
  completedOrders,
  totalSpent,
}: OrderStatsProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Active Orders */}
      <div className="bg-white dark:bg-[#101826] border border-slate-200 dark:border-cyan-500/10 rounded-3xl p-6 shadow-sm dark:shadow-[0_0_30px_rgba(6,182,212,0.08)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-2">
              Active Orders
            </p>
            <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
              {activeOrders.toString().padStart(2, "0")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600 dark:text-cyan-400">
              <path d="M12 2H2v10l9.29 9.29a2 2 0 0 0 2.82 0l6.58-6.58a2 2 0 0 0 0-2.82L12 2Z" />
              <path d="M7 7h.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* Completed Orders */}
      <div className="bg-white dark:bg-[#101826] border border-slate-200 dark:border-emerald-500/10 rounded-3xl p-6 shadow-sm dark:shadow-[0_0_30px_rgba(16,185,129,0.08)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-2">
              Completed
            </p>
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedOrders.toString().padStart(2, "0")}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600 dark:text-emerald-400">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Spent */}
      <div className="bg-white dark:bg-[#101826] border border-slate-200 dark:border-purple-500/10 rounded-3xl p-6 shadow-sm dark:shadow-[0_0_30px_rgba(168,85,247,0.08)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-2">
              Total Spent
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 dark:text-purple-400">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}