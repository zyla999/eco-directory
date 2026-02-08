"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Store } from "@/types/store";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stores from API route
    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => {
        setStores(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const storesWithCoords = stores.filter((s) => s.location.coordinates);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Store Map</h1>
            <p className="text-sm text-gray-500">
              {loading
                ? "Loading stores..."
                : `${storesWithCoords.length} stores shown on map`}
            </p>
          </div>
          <Link
            href="/stores"
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View as list →
          </Link>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <Map stores={stores} />
      </div>
    </div>
  );
}
