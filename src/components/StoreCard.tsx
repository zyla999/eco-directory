import Link from "next/link";
import Image from "next/image";
import { Store } from "@/types/store";
import { categoryColors } from "@/lib/categoryConfig";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/stores/${store.id}`}
      className="relative block h-full bg-white rounded-lg shadow-sm border border-gray-200 card-hover-lift overflow-hidden"
    >
      {/* Corner icon badges */}
      {(store.offersWholesale || store.offersLocalDelivery) && (
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          {store.offersWholesale && (
            <span
              className="badge-tooltip flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 border border-amber-200 shadow-sm"
              data-tip="Offers Wholesale"
            >
              <svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
          )}
          {store.offersLocalDelivery && (
            <span
              className="badge-tooltip flex items-center justify-center w-7 h-7 rounded-full bg-teal-100 border border-teal-200 shadow-sm"
              data-tip="Offers Local Delivery"
            >
              <svg className="w-3.5 h-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </span>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-green-700">
              {store.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {store.location.city}, {store.location.state}
              {store.type === "online" && " (Online)"}
            </p>
          </div>
          <Image
            src={store.logo || "/logos/default.svg"}
            alt={`${store.name} logo`}
            width={48}
            height={48}
            className="w-12 h-12 object-contain rounded"
          />
        </div>

        {store.description && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">
            {store.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {store.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                categoryColors[category] || "bg-gray-100 text-gray-800"
              }`}
            >
              {category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          ))}
        </div>

        {store.website && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            {new URL(store.website).hostname.replace("www.", "")}
          </div>
        )}
      </div>
    </Link>
  );
}
