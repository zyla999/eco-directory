"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CategoryInfo {
  id: string;
  name: string;
}

interface Props {
  categories: CategoryInfo[];
  selectedCategories: string[];
  baseParams: Record<string, string>;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  baseParams,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedCategories));

  function navigate(newSelected: Set<string>) {
    const params = new URLSearchParams(baseParams);
    if (newSelected.size > 0) {
      params.set("category", Array.from(newSelected).sort().join(","));
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    router.push(`/stores${qs ? `?${qs}` : ""}`);
  }

  function toggleCategory(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
    navigate(next);
  }

  function clearAll() {
    setSelected(new Set());
    navigate(new Set());
  }

  const hasAnySelected = selected.size > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Category</h4>
        {hasAnySelected && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {!hasAnySelected && (
        <p className="text-sm text-green-600 font-medium mb-2">All Categories</p>
      )}

      <div className="space-y-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`flex items-center gap-2 text-sm w-full text-left ${
              selected.has(cat.id)
                ? "text-green-600 font-medium"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            <span
              className={`inline-block w-3.5 h-3.5 rounded border flex-shrink-0 ${
                selected.has(cat.id)
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300"
              }`}
            >
              {selected.has(cat.id) && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
