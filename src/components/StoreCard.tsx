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
      className="block h-full bg-white rounded-lg shadow-sm border border-gray-200 card-hover-lift overflow-hidden"
    >
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
              {category.replace("-", " ")}
            </span>
          ))}
          {store.offersWholesale && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
              Wholesale Available
            </span>
          )}
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
