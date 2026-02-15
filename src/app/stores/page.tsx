import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import CategoryFilter from "@/components/CategoryFilter";
import StateProvinceFilter from "@/components/StateProvinceFilter";
import {
  getAllStores,
  searchStores,
  getCategories,
  getStatesWithStores,
} from "@/lib/stores";
import { haversineKm } from "@/lib/geo";

export const revalidate = 3600;

interface StoresPageProps {
  searchParams: Promise<{ q?: string; category?: string; state?: string; wholesale?: string; delivery?: string; near?: string }>;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categoryFilter = params.category || "";
  const stateFilter = params.state || "";
  const wholesaleFilter = params.wholesale === "true";
  const deliveryFilter = params.delivery === "true";
  const nearParam = params.near || "";

  const selectedCategories = categoryFilter
    ? categoryFilter.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  const selectedStates = stateFilter
    ? stateFilter.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
    : [];

  let stores = query ? await searchStores(query) : await getAllStores();

  if (selectedCategories.length > 0) {
    stores = stores.filter((s) =>
      s.categories.some((c) => selectedCategories.includes(c))
    );
  }

  if (selectedStates.length > 0) {
    stores = stores.filter((s) =>
      selectedStates.includes(s.location.state.toUpperCase())
    );
  }

  if (wholesaleFilter) {
    stores = stores.filter((s) => s.offersWholesale);
  }

  if (deliveryFilter) {
    stores = stores.filter((s) => s.offersLocalDelivery);
  }

  // Near Me: parse lat,lng and sort by distance
  let userLat: number | null = null;
  let userLng: number | null = null;
  let distanceMap: Map<string, number> | null = null;

  if (nearParam) {
    const parts = nearParam.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        userLat = lat;
        userLng = lng;
        distanceMap = new Map();

        for (const store of stores) {
          const coords = store.location.coordinates;
          if (coords) {
            distanceMap.set(store.id, haversineKm(lat, lng, coords.lat, coords.lng));
          }
        }

        stores = [...stores].sort((a, b) => {
          const dA = distanceMap!.get(a.id);
          const dB = distanceMap!.get(b.id);
          if (dA == null && dB == null) return 0;
          if (dA == null) return 1;
          if (dB == null) return -1;
          return dA - dB;
        });
      }
    }
  }

  const categories = await getCategories();
  const statesWithStores = await getStatesWithStores();

  // Base params for CategoryFilter (everything except category)
  const categoryBaseParams: Record<string, string> = {};
  if (stateFilter) categoryBaseParams.state = stateFilter;
  if (wholesaleFilter) categoryBaseParams.wholesale = "true";
  if (deliveryFilter) categoryBaseParams.delivery = "true";

  // Base params for StateProvinceFilter (everything except state)
  const stateBaseParams: Record<string, string> = {};
  if (categoryFilter) stateBaseParams.category = categoryFilter;
  if (wholesaleFilter) stateBaseParams.wholesale = "true";
  if (deliveryFilter) stateBaseParams.delivery = "true";

  return (
    <div>
      {/* Search Banner */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#1B3A2D" }}
      >
        <div className="eco-hero-grain" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <h1
            className="text-3xl md:text-4xl font-bold mb-5"
            style={{ fontFamily: "var(--font-fraunces)", color: "#FAF8F4" }}
          >
            Browse Directory
          </h1>
          <div className="max-w-2xl">
            <SearchBar initialQuery={query} />
          </div>
          <p className="mt-3 text-sm" style={{ color: "rgba(250,248,244,0.5)" }}>
            {stores.length} business{stores.length !== 1 ? "es" : ""} listed
            {query && <> for &ldquo;{query}&rdquo;</>}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Near Me info line */}
      {userLat != null && (
        <div
          className="mb-6 flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg"
          style={{ background: "var(--eco-mist)", color: "var(--eco-sage)" }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Showing stores nearest to your location
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
        {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <CategoryFilter
                  categories={categories}
                  selectedCategories={selectedCategories}
                  baseParams={categoryBaseParams}
                />
              </div>

              {/* Wholesale & Delivery Filters */}
              <div className="mb-5 -mx-6 px-6 py-3 bg-gray-50 border-y border-gray-100 space-y-2.5">
                <a
                  href={`/stores?${[
                    categoryFilter ? `category=${categoryFilter}` : "",
                    stateFilter ? `state=${stateFilter}` : "",
                    !wholesaleFilter ? "wholesale=true" : "",
                    deliveryFilter ? "delivery=true" : "",
                  ].filter(Boolean).join("&")}`}
                  className={`flex items-center gap-2 text-sm ${
                    wholesaleFilter
                      ? "text-amber-700 font-medium"
                      : "text-gray-600 hover:text-amber-700"
                  }`}
                >
                  <span className={`inline-block w-3.5 h-3.5 rounded border ${
                    wholesaleFilter
                      ? "bg-amber-500 border-amber-500"
                      : "border-gray-300"
                  }`}>
                    {wholesaleFilter && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  Wholesale Available
                </a>
                <a
                  href={`/stores?${[
                    categoryFilter ? `category=${categoryFilter}` : "",
                    stateFilter ? `state=${stateFilter}` : "",
                    wholesaleFilter ? "wholesale=true" : "",
                    !deliveryFilter ? "delivery=true" : "",
                  ].filter(Boolean).join("&")}`}
                  className={`flex items-center gap-2 text-sm ${
                    deliveryFilter
                      ? "text-teal-700 font-medium"
                      : "text-gray-600 hover:text-teal-700"
                  }`}
                >
                  <span className={`inline-block w-3.5 h-3.5 rounded border ${
                    deliveryFilter
                      ? "bg-teal-500 border-teal-500"
                      : "border-gray-300"
                  }`}>
                    {deliveryFilter && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  Offers Local Delivery
                </a>
              </div>

              {/* State/Province Filter */}
              <StateProvinceFilter
                statesWithStores={statesWithStores}
                selectedStates={selectedStates}
                baseParams={stateBaseParams}
              />
            </div>
          </aside>

        {/* Store Grid */}
        <div className="flex-1">
          {stores.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {stores.map((store, i) => {
                const dist = distanceMap?.get(store.id);
                return (
                  <div
                    key={store.id}
                    className="h-full relative"
                    style={{
                      animation: `fade-in-up 0.5s ease-out ${(i % 6) * 0.08}s both`,
                    }}
                  >
                    {dist != null && (
                      <span
                        className="absolute top-2 left-2 z-10 px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{
                          background: "var(--eco-forest)",
                          color: "var(--eco-cream)",
                        }}
                      >
                        {dist < 1 ? "< 1 km" : `${Math.round(dist)} km`} away
                      </span>
                    )}
                    <StoreCard store={store} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">
                No businesses found matching your criteria.
              </p>
              <a
                href="/stores"
                className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
              >
                Clear filters
              </a>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
