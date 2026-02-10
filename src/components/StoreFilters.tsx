"use client";

import { Store, Category, StoreCategory } from "@/types/store";
import { categoryColors } from "@/lib/categoryConfig";

interface StoreFiltersProps {
  categories: Category[];
  stores: Store[];
  filteredCount: number;
  query: string;
  onQueryChange: (q: string) => void;
  country: string;
  onCountryChange: (c: string) => void;
  region: string;
  onRegionChange: (r: string) => void;
  storeType: string;
  onStoreTypeChange: (t: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (cat: string) => void;
  activePill: string;
  onPillToggle: (pill: string) => void;
  sort: string;
  onSortChange: (s: string) => void;
  onReset: () => void;
}

const PILL_GROUPS: Record<string, StoreCategory[]> = {
  Shop: ["refillery", "bulk-foods", "zero-waste", "thrift-consignment", "farmers-market"],
  Supplier: ["manufacturer", "wholesale"],
  Service: ["service-provider"],
};

export default function StoreFilters({
  categories,
  stores,
  filteredCount,
  query,
  onQueryChange,
  country,
  onCountryChange,
  region,
  onRegionChange,
  storeType,
  onStoreTypeChange,
  selectedCategories,
  onCategoryToggle,
  activePill,
  onPillToggle,
  sort,
  onSortChange,
  onReset,
}: StoreFiltersProps) {
  // Build region options based on country
  const regions = (() => {
    const regionSet = new Map<string, string>();
    for (const store of stores) {
      const r = store.location.region;
      if (!r) continue;
      if (country && country !== store.location.country) continue;
      if (!regionSet.has(r)) {
        regionSet.set(r, store.location.state);
}
    }
    return Array.from(regionSet.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  })();

  // Count stores per category (from unfiltered but country/region-scoped list)
  const categoryCounts = (() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.id] = stores.filter((s) => {
        if (country && s.location.country !== country) return false;
        if (region && s.location.region !== region) return false;
        return s.categories.includes(cat.id);
      }).length;
    }
    return counts;
  })();

  const hasActiveFilters =
    query || country || region || storeType || selectedCategories.length > 0 || activePill || sort !== "featured";

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name, city, keywords..."
          className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none px-4 py-3 pr-10"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Primary filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Country */}
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        >
          <option value="">All Countries</option>
          <option value="Canada">Canada</option>
          <option value="USA">USA</option>
        </select>

        {/* Region */}
        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Store Type */}
        <select
          value={storeType}
          onChange={(e) => onStoreTypeChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        >
          <option value="">All Types</option>
          <option value="brick-and-mortar">Brick & Mortar</option>
          <option value="online">Online</option>
          <option value="both">Both</option>
          <option value="mobile">Mobile</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        >
          <option value="featured">Featured First</option>
          <option value="newest">Newest</option>
          <option value="az">Alphabetical (A-Z)</option>
        </select>

        {/* Results count + Reset */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-gray-600">
            {filteredCount} result{filteredCount !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Quick filter pills */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(PILL_GROUPS).map((pill) => (
          <button
            key={pill}
            onClick={() => onPillToggle(pill)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              activePill === pill
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Category checkboxes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => onCategoryToggle(cat.id)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-green-700">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-1 ${
                    categoryColors[cat.id] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {categoryCounts[cat.id] ?? 0}
                </span>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export { PILL_GROUPS };
