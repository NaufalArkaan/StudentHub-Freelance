import React from "react";
import { OrderStatus } from "../types";

interface StatusBadgeProps {
  status: OrderStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Kamus untuk menerjemahkan status database ke UI yang cantik
  const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    in_progress: {
      label: "In Progress",
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    pending: {
      label: "Pending",
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
    },
  };

  // Jika status tidak dikenali, fallback ke Pending
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${config.dot}`}></span>
      {config.label}
    </span>
  );
}