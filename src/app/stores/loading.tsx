export default function StoresLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title skeleton */}
      <div className="mb-8">
        <div className="skeleton-pulse h-8 w-56 rounded-lg mb-4" />
        <div className="skeleton-pulse h-12 w-full max-w-2xl rounded-lg" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
        {/* Sidebar skeleton */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="rounded-lg p-6" style={{ background: "var(--eco-mist)" }}>
            <div className="skeleton-pulse h-5 w-16 rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-pulse h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
            <div className="skeleton-pulse h-px w-full my-5" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-pulse h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
          </div>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="skeleton-pulse h-5 w-32 rounded mb-4" />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
