import { OrderStatus } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent transition-colors ${colors.bg} ${colors.text}`}
    >
      {label}
    </span>
  );
}