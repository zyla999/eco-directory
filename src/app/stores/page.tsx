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

export const revalidate = 3600;

interface StoresPageProps {
  searchParams: Promise<{ q?: string; category?: string; state?: string; wholesale?: string; delivery?: string }>;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categoryFilter = params.category || "";
  const stateFilter = params.state || "";
  const wholesaleFilter = params.wholesale === "true";
  const deliveryFilter = params.delivery === "true";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Directory</h1>
        <SearchBar initialQuery={query} />
      </div>

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
          <div className="mb-4 text-gray-600">
            {stores.length} business{stores.length !== 1 ? "es" : ""} found
            {query && ` for "${query}"`}
          </div>

          {stores.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {stores.map((store, i) => (
                <div
                  key={store.id}
                  className="h-full"
                  style={{
                    animation: `fade-in-up 0.5s ease-out ${(i % 6) * 0.08}s both`,
                  }}
                >
                  <StoreCard store={store} />
                </div>
              ))}
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
  );
}
