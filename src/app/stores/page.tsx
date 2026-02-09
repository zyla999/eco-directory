import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import {
  getAllStores,
  searchStores,
  getCategories,
  getStatesWithStores,
} from "@/lib/stores";

export const revalidate = 3600;

interface StoresPageProps {
  searchParams: Promise<{ q?: string; category?: string; state?: string; wholesale?: string }>;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categoryFilter = params.category || "";
  const stateFilter = params.state || "";
  const wholesaleFilter = params.wholesale === "true";

  let stores = query ? await searchStores(query) : await getAllStores();

  if (categoryFilter) {
    stores = stores.filter((s) =>
      s.categories.includes(categoryFilter as any)
    );
  }

  if (stateFilter) {
    stores = stores.filter(
      (s) => s.location.state.toLowerCase() === stateFilter.toLowerCase()
    );
  }

  if (wholesaleFilter) {
    stores = stores.filter((s) => s.offersWholesale);
  }

  const categories = await getCategories();
  const statesWithStores = await getStatesWithStores();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Directory</h1>
        <SearchBar initialQuery={query} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <AnimateOnScroll animation="slide-in-left">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Category
                </h4>
                <div className="space-y-2">
                  <a
                    href="/stores"
                    className={`block text-sm ${
                      !categoryFilter
                        ? "text-green-600 font-medium"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    All Categories
                  </a>
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/stores?category=${cat.id}${
                        stateFilter ? `&state=${stateFilter}` : ""
                      }`}
                      className={`block text-sm ${
                        categoryFilter === cat.id
                          ? "text-green-600 font-medium"
                          : "text-gray-600 hover:text-green-600"
                      }`}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Wholesale Filter */}
              <div className="mb-6">
                <a
                  href={`/stores?${[
                    categoryFilter ? `category=${categoryFilter}` : "",
                    stateFilter ? `state=${stateFilter}` : "",
                    !wholesaleFilter ? "wholesale=true" : "",
                  ].filter(Boolean).join("&")}`}
                  className={`flex items-center gap-2 text-sm ${
                    wholesaleFilter
                      ? "text-amber-700 font-medium"
                      : "text-gray-600 hover:text-amber-700"
                  }`}
                >
                  <span className={`inline-block w-4 h-4 rounded border ${
                    wholesaleFilter
                      ? "bg-amber-500 border-amber-500"
                      : "border-gray-300"
                  }`}>
                    {wholesaleFilter && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  Wholesale Available
                </a>
              </div>

              {/* State Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </h4>
                <div className="space-y-2">
                  <a
                    href={`/stores${
                      categoryFilter ? `?category=${categoryFilter}` : ""
                    }`}
                    className={`block text-sm ${
                      !stateFilter
                        ? "text-green-600 font-medium"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    All Locations
                  </a>
                  {statesWithStores.map((si) => (
                    <div key={si.stateCode} className="flex items-center justify-between">
                      <a
                        href={`/stores?state=${si.stateCode}${
                          categoryFilter ? `&category=${categoryFilter}` : ""
                        }`}
                        className={`block text-sm ${
                          stateFilter === si.stateCode
                            ? "text-green-600 font-medium"
                            : "text-gray-600 hover:text-green-600"
                        }`}
                      >
                        {si.stateCode}
                      </a>
                      <a
                        href={`/location/${si.slug}`}
                        className="text-xs text-gray-400 hover:text-green-600"
                        title={`View all businesses in ${si.stateName}`}
                      >
                        View page →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </AnimateOnScroll>

        {/* Store Grid */}
        <div className="flex-1">
          <div className="mb-4 text-gray-600">
            {stores.length} business{stores.length !== 1 ? "es" : ""} found
            {query && ` for "${query}"`}
          </div>

          {stores.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {stores.map((store, i) => (
                <AnimateOnScroll key={store.id} animation="fade-in-up" stagger={Math.min((i % 6) + 1, 7)} className="h-full">
                  <StoreCard store={store} />
                </AnimateOnScroll>
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
