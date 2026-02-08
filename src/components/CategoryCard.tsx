import Link from "next/link";
import { Category } from "@/types/store";

interface CategoryCardProps {
  category: Category;
  storeCount: number;
}

const icons: Record<string, string> = {
  droplet: "💧",
  leaf: "🌿",
  wheat: "🌾",
  recycle: "♻️",
  shirt: "👕",
  store: "🏪",
  globe: "🌐",
};

export default function CategoryCard({
  category,
  storeCount,
}: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.id}`}
      className="block h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover-scale"
    >
      <div className="text-4xl mb-3">{icons[category.icon] || "📦"}</div>
      <h3 className="font-semibold text-gray-900">{category.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{storeCount} stores</p>
    </Link>
  );
}
