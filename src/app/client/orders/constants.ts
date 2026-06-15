import { OrderStatus } from "./types";

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-500/10",
    text: "text-yellow-700 dark:text-yellow-500"
  },
  in_progress: {
    bg: "bg-cyan-100 dark:bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-500"
  },
  completed: {
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-500"
  },
  cancelled: {
    bg: "bg-red-100 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-500"
  },
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};