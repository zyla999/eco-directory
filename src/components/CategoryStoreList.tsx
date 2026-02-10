"use client";

import { useState, useMemo } from "react";
import { Store, Sponsor } from "@/types/store";
import StoreCard from "@/components/StoreCard";
import SponsorCard from "@/components/SponsorCard";
import Link from "next/link";

const CATEGORY_SLOTS = 2;

interface CategoryStoreListProps {
  stores: Store[];
  categoryName: string;
  mainSponsors: Sponsor[];
  categorySponsors: Sponsor[];
}

export default function CategoryStoreList({
  stores,
  categoryName,
  mainSponsors,
  categorySponsors,
}: CategoryStoreListProps) {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [storeTypes, setStoreTypes] = useState<string[]>([]);
  const [wholesale, setWholesale] = useState(false);
  const [sort, setSort] = useState("az");

  // Derive available countries from all stores in this category
  const countries = useMemo(() => {
    const set = new Set(stores.map((s) => s.location.country));
    return Array.from(set).sort();
  }, [stores]);

  // Derive available states based on selected country
  const states = useMemo(() => {
    if (!country) return [];
    const set = new Set(
      stores
        .filter((s) => s.location.country === country)
        .map((s) => s.location.state)
    );
    return Array.from(set).sort();
  }, [stores, country]);

  // Derive available cities based on selected state
  const cities = useMemo(() => {
    if (!state) return [];
    const set = new Set(
      stores
        .filter(
          (s) => s.location.country === country && s.location.state === state
        )
        .map((s) => s.location.city)
    );
    return Array.from(set).sort();
  }, [stores, country, state]);

  // Apply all filters
  const filtered = useMemo(() => {
    let result = stores;

    if (country) {
      result = result.filter((s) => s.location.country === country);
    }
    if (state) {
      result = result.filter((s) => s.location.state === state);
    }
    if (city) {
      result = result.filter((s) => s.location.city === city);
    }
    if (storeTypes.length > 0) {
      result = result.filter((s) =>
        storeTypes.some((t) => s.type.includes(t))
      );
    }
    if (wholesale) {
      result = result.filter((s) => s.offersWholesale);
    }

    // Sort
    if (sort === "az") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "newest") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [stores, country, state, city, storeTypes, wholesale, sort]);

  const hasActiveFilters =
    country || state || city || storeTypes.length > 0 || wholesale || sort !== "az";

  function handleCountryChange(value: string) {
    setCountry(value);
    setState("");
    setCity("");
  }

  function handleStateChange(value: string) {
    setState(value);
    setCity("");
  }

  function resetFilters() {
    setCountry("");
    setState("");
    setCity("");
    setStoreTypes([]);
    setWholesale(false);
    setSort("az");
  }

  return (
    <>
      {/* Main sponsors — site-wide featured partners */}
      {mainSponsors.length > 0 && (
        <div className="mb-6">
          <div
            className={`grid gap-4 ${
              mainSponsors.length === 1
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {mainSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} variant="banner" />
            ))}
          </div>
        </div>
      )}

      {/* Category-specific sponsor slots — always 2 */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: CATEGORY_SLOTS }).map((_, i) => {
            const sponsor = categorySponsors[i];
            if (sponsor) {
              return (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  variant="sidebar"
                />
              );
            }
            return (
              <div
                key={`placeholder-${i}`}
                className="border-2 border-dashed border-amber-200 bg-amber-50/30 rounded-lg p-4 flex flex-col items-center justify-center text-center min-h-[120px]"
              >
                <span className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-1">
                  Sponsored
                </span>
                <p className="text-sm text-gray-400">
                  Advertise your {categoryName} brand here
                </p>
                <Link
                  href="/about"
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-2"
                >
                  Learn more
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters + Grid layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 lg:sticky lg:top-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
              Filters
            </h3>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* State/Province — only when country selected */}
            {country && states.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State / Province
                </label>
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">All</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* City — only when state selected */}
            {state && cities.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                >
                  <option value="">All</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Store Type */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Store Type
              </span>
              {[
                { value: "brick-and-mortar", label: "Brick & Mortar" },
                { value: "online", label: "Online" },
                { value: "mobile", label: "Mobile" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer mb-1.5"
                >
                  <input
                    type="checkbox"
                    checked={storeTypes.includes(opt.value)}
                    onChange={(e) =>
                      setStoreTypes((prev) =>
                        e.target.checked
                          ? [...prev, opt.value]
                          : prev.filter((t) => t !== opt.value)
                      )
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Wholesale */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wholesale}
                onChange={(e) => setWholesale(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Wholesale only</span>
            </label>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              >
                <option value="az">A–Z</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Result count */}
            <p className="text-sm text-gray-500">
              {filtered.length} business{filtered.length !== 1 ? "es" : ""}{" "}
              found
            </p>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        </aside>

        {/* Store grid */}
        <div className="flex-1">
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((store) => (
                <div key={store.id} className="h-full">
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">
                No businesses match your filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
                >
                  Reset filters
                </button>
              )}
              <Link
                href="/submit"
                className="text-green-600 hover:text-green-700 font-medium mt-2 block"
              >
                List your business
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
