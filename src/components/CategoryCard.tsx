import Link from "next/link";
import { Category } from "@/types/store";
import { categoryIcons } from "@/lib/categoryConfig";

interface CategoryCardProps {
  category: Category;
  storeCount: number;
}

export default function CategoryCard({
  category,
  storeCount,
}: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.id}`}
      className="block h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover-scale"
    >
      <div className="text-4xl mb-3">{categoryIcons[category.icon] || "📦"}</div>
      <h3 className="font-semibold text-gray-900">{category.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{storeCount} listings</p>
    </Link>
  );
}
