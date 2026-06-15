import Image from "next/image";
import { Order } from "../types";
import { StatusBadge } from "./status-badge";
import { ActionButton } from "./action-button";

interface OrdersTableProps {
  orders: Order[];
  onChatClick: (orderId: string) => void;
  onReviewClick: (orderId: string) => void;
}

export function OrdersTable({
  orders,
  onChatClick,
  onReviewClick,
}: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="
        w-full
        bg-white
        dark:bg-[#101826]
        border
        border-slate-200
        dark:border-cyan-500/10
        rounded-3xl
        overflow-hidden
        backdrop-blur-xl
        shadow-sm
        dark:shadow-[0_0_30px_rgba(6,182,212,0.08)]
        transition-all
      "
    >
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-zinc-300">
          <thead
            className="
              bg-slate-50
              dark:bg-[#0F172A]
              text-cyan-600
              dark:text-cyan-400
              text-xs
              uppercase
              border-b
              border-slate-200
              dark:border-cyan-500/10
            "
          >
            <tr>
              <th className="px-6 py-5">Service Name</th>
              <th className="px-6 py-5">Freelancer</th>
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-cyan-500/10">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="
  hover:bg-cyan-50
  dark:hover:bg-cyan-500/5
  transition-all
  duration-200
  group
"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    {order.serviceImage ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <Image
                          src={order.serviceImage}
                          alt={order.serviceName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-800 shrink-0" />
                    )}

                    <div>
                      <div
                        className="
                          font-semibold
                          text-slate-900
                          dark:text-white
                          group-hover:text-cyan-600
                          dark:group-hover:text-cyan-400
                          transition-colors
                        "
                      >
                        {order.serviceName}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                        {order.serviceCategory}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    {order.freelancerAvatar ? (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-cyan-500/10">
                        <Image
                          src={order.freelancerAvatar}
                          alt={order.freelancerName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-800 shrink-0" />
                    )}

                    <span className="font-medium text-slate-700 dark:text-zinc-200">
                      {order.freelancerName}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-5 whitespace-nowrap text-slate-500 dark:text-zinc-400">
                  {formatDate(order.createdAt)}
                </td>

                <td className="px-6 py-5 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end">
                    <ActionButton
                      status={order.status}
                      reviewed={order.reviewed}
                      onClickChat={() => onChatClick(order.id)}
                      onClickReview={() => onReviewClick(order.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="block md:hidden divide-y divide-slate-200 dark:divide-cyan-500/10">
        {orders.map((order) => (
          <div key={order.id} className="p-5 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3">
                {order.serviceImage ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={order.serviceImage}
                      alt={order.serviceName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0" />
                )}

                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {order.serviceName}
                  </div>

                  <div className="text-xs text-zinc-500 mt-1">
                    {order.serviceCategory}
                  </div>
                </div>
              </div>

              <StatusBadge status={order.status} />
            </div>

            <div className="flex justify-between items-center border-t border-cyan-500/10 pt-3">
              <div className="flex items-center gap-2">
                {order.freelancerAvatar ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden">
                    <Image
                      src={order.freelancerAvatar}
                      alt={order.freelancerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-800" />
                )}

                <span className="text-xs text-slate-700 dark:text-zinc-300">
                  {order.freelancerName}
                </span>
              </div>

              <span className="text-xs text-zinc-500">
                {formatDate(order.createdAt)}
              </span>
            </div>

            {(order.status === "in_progress" ||
              order.status === "completed") && (
                <div className="pt-3">
                  <ActionButton
                    status={order.status}
                    reviewed={order.reviewed}
                    onClickChat={() => onChatClick(order.id)}
                    onClickReview={() => onReviewClick(order.id)}
                  />
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="
          px-6
          py-4
          border-t
          border-slate-200
          dark:border-cyan-500/10
          bg-slate-50
          dark:bg-[#0F172A]
          flex
          items-center
          justify-between
          text-sm
          text-slate-500
          dark:text-zinc-500
        "
      >
        <div>
          Showing 1 to {orders.length} of {orders.length} orders
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled
            className="
              w-8
              h-8
              rounded-lg
              border
              border-slate-200
              dark:border-cyan-500/10
              flex
              items-center
              justify-center
              hover:bg-slate-100
              dark:hover:bg-cyan-500/10
              transition-colors
            "
          >
            &lt;
          </button>

          <button
            disabled
            className="
              w-8
              h-8
              rounded-lg
              border
              border-cyan-500/10
              flex
              items-center
              justify-center
              hover:bg-cyan-500/10
              transition-colors
              disabled:opacity-30
            "
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}