"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Store, StoreCategory } from "@/types/store";
import { categoryPinColors, categoryLabels } from "@/lib/categoryConfig";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

const allCategories = Object.keys(categoryPinColors) as StoreCategory[];

export default function MapPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<StoreCategory>>(
    new Set(allCategories)
  );

  useEffect(() => {
    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => {
        setStores(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleCategory(cat: StoreCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  const allSelected = activeCategories.size === allCategories.length;

  function toggleAll() {
    setActiveCategories(allSelected ? new Set() : new Set(allCategories));
  }

  // Only physical/mobile stores with coords, filtered by active categories
  const mappableStores = stores.filter(
    (s) =>
      s.type !== "online" &&
      s.location.coordinates &&
      s.categories.some((c) => activeCategories.has(c))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Business Map</h1>
              <p className="text-sm text-gray-500">
                {loading
                  ? "Loading businesses..."
                  : `${mappableStores.length} businesses shown on map`}
              </p>
            </div>
            <Link
              href="/stores"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              View as list →
            </Link>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={toggleAll}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                allSelected
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              All
            </button>
            {allCategories.map((id) => {
              const active = activeCategories.has(id);
              const color = categoryPinColors[id];
              return (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? "text-white border-transparent"
                      : "bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
                  }`}
                  style={active ? { background: color, borderColor: color } : {}}
                >
                  {categoryLabels[id] || id}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <Map stores={mappableStores} />
      </div>
    </div>
  );
}
