export default function LoadingOrders() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-pulse p-4 md:p-8">
      {/* Header Skeleton */}
      <div className="space-y-4 max-w-2xl">
        <div className="h-10 w-48 bg-gray-200 dark:bg-white/5 rounded-lg"></div>
        <div className="h-12 w-full bg-gray-200 dark:bg-white/5 rounded-lg"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-white/5 rounded-xl"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="w-full h-96 bg-gray-200 dark:bg-white/5 rounded-2xl"></div>
    </div>
  );
}