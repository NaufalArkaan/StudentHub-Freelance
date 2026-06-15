import { OrderStatus } from "../types";

interface ActionButtonProps {
  status: OrderStatus;
  reviewed: boolean;
  onClickChat?: () => void;
  onClickReview?: () => void;
}

export function ActionButton({ status, reviewed, onClickChat, onClickReview }: ActionButtonProps) {
  if (status === "in_progress") {
    return (
      <button
        onClick={onClickChat}
        className="px-5 py-2 rounded-lg border border-cyan-500 text-cyan-600 dark:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors text-sm font-medium"
      >
        Chat
      </button>
    );
  }

  if (status === "completed") {
    if (!reviewed) {
      return (
        <button
          onClick={onClickReview}
          className="px-5 py-2 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition-colors text-sm font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          Leave Review
        </button>
      );
    } else {
      return (
        <button
          disabled
          className="px-5 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 dark:bg-white/5 dark:border-white/10 dark:text-zinc-500 cursor-not-allowed text-sm font-medium"
        >
          Reviewed
        </button>
      );
    }
  }

  return null;
}