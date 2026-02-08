"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
}

export default function SearchBar({
  initialQuery = "",
  large = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/stores?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses by name, city, or category..."
          className={`w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition ${
            large ? "px-6 py-4 text-lg" : "px-4 py-3"
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${
            large ? "top-2 px-6 py-2" : "top-1.5 px-4 py-1.5"
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
