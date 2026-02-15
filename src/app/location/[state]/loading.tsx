export default function StatePageLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="skeleton-pulse h-4 w-12 rounded" />
        <span style={{ color: "var(--eco-warm-gray)" }}>/</span>
        <div className="skeleton-pulse h-4 w-16 rounded" />
        <span style={{ color: "var(--eco-warm-gray)" }}>/</span>
        <div className="skeleton-pulse h-4 w-28 rounded" />
      </div>

      {/* Header banner skeleton */}
      <div
        className="rounded-xl overflow-hidden p-8 sm:p-10 md:p-12 mb-10"
        style={{ background: "var(--eco-forest)" }}
      >
        <div className="skeleton-pulse h-3 w-16 rounded mb-3" style={{ opacity: 0.15 }} />
        <div className="skeleton-pulse h-10 w-56 rounded mb-2" style={{ opacity: 0.15 }} />
        <div className="skeleton-pulse h-4 w-36 rounded" style={{ opacity: 0.15 }} />
      </div>

      {/* Store grid skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--eco-border)" }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="skeleton-pulse h-5 w-3/4 rounded mb-2" />
                  <div className="skeleton-pulse h-4 w-1/2 rounded" />
                </div>
                <div className="skeleton-pulse w-12 h-12 rounded flex-shrink-0" />
              </div>
              <div className="skeleton-pulse h-4 w-full rounded mb-1.5" />
              <div className="skeleton-pulse h-4 w-2/3 rounded mb-4" />
              <div className="flex gap-2">
                <div className="skeleton-pulse h-6 w-20 rounded-full" />
                <div className="skeleton-pulse h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
