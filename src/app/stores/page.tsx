import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import {
  getAllStores,
  searchStores,
  getCategories,
  getUniqueStates,
} from "@/lib/stores";

interface StoresPageProps {
  searchParams: Promise<{ q?: string; category?: string; state?: string }>;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categoryFilter = params.category || "";
  const stateFilter = params.state || "";

  let stores = query ? searchStores(query) : getAllStores();

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

  const categories = getCategories();
  const states = getUniqueStates();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Stores</h1>
        <SearchBar initialQuery={query} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
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
                {states.map((state) => (
                  <a
                    key={state}
                    href={`/stores?state=${state}${
                      categoryFilter ? `&category=${categoryFilter}` : ""
                    }`}
                    className={`block text-sm ${
                      stateFilter === state
                        ? "text-green-600 font-medium"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    {state}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Store Grid */}
        <div className="flex-1">
          <div className="mb-4 text-gray-600">
            {stores.length} store{stores.length !== 1 ? "s" : ""} found
            {query && ` for "${query}"`}
          </div>

          {stores.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">
                No stores found matching your criteria.
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
