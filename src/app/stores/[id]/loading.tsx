export default function StoreDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="skeleton-pulse h-4 w-12 rounded" />
        <span style={{ color: "var(--eco-warm-gray)" }}>/</span>
        <div className="skeleton-pulse h-4 w-14 rounded" />
        <span style={{ color: "var(--eco-warm-gray)" }}>/</span>
        <div className="skeleton-pulse h-4 w-24 rounded" />
      </div>

      {/* Hero banner skeleton */}
      <div
        className="rounded-xl overflow-hidden p-8 sm:p-10"
        style={{ background: "var(--eco-forest)" }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            className="rounded-2xl"
            style={{
              width: 144,
              height: 144,
              background: "rgba(248,245,240,0.1)",
            }}
          />
          <div className="flex-1 w-full">
            <div className="skeleton-pulse h-3 w-24 rounded mb-3" style={{ opacity: 0.15 }} />
            <div className="skeleton-pulse h-9 w-64 rounded mb-2" style={{ opacity: 0.15 }} />
            <div className="skeleton-pulse h-4 w-40 rounded mb-4" style={{ opacity: 0.15 }} />
            <div className="flex gap-2">
              <div className="skeleton-pulse h-7 w-20 rounded-full" style={{ opacity: 0.15 }} />
              <div className="skeleton-pulse h-7 w-24 rounded-full" style={{ opacity: 0.15 }} />
            </div>
          </div>
        </div>
      </div>

      {/* About skeleton */}
      <div className="mt-10">
        <div className="skeleton-pulse h-3 w-14 rounded mb-4" />
        <div className="space-y-2">
          <div className="skeleton-pulse h-4 w-full rounded" />
          <div className="skeleton-pulse h-4 w-full rounded" />
          <div className="skeleton-pulse h-4 w-3/4 rounded" />
        </div>
      </div>

      {/* Details grid skeleton */}
      <div
        className="mt-10 p-6 sm:p-8 rounded-xl"
        style={{ background: "var(--eco-mist)" }}
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="skeleton-pulse h-3 w-20 rounded mb-4" />
            <div className="space-y-2">
              <div className="skeleton-pulse h-4 w-48 rounded" />
              <div className="skeleton-pulse h-4 w-36 rounded" />
              <div className="skeleton-pulse h-4 w-24 rounded" />
            </div>
          </div>
          <div>
            <div className="skeleton-pulse h-3 w-16 rounded mb-4" />
            <div className="space-y-2">
              <div className="skeleton-pulse h-4 w-32 rounded" />
              <div className="skeleton-pulse h-4 w-44 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
