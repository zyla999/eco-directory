"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
}

interface Suggestion {
  type: "store" | "city" | "category";
  label: string;
  sub?: string;
  href: string;
}

export default function SearchBar({
  initialQuery = "",
  large = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced autocomplete fetch
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/stores/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const items: Suggestion[] = [];

      for (const s of data.stores || []) {
        items.push({
          type: "store",
          label: s.name,
          sub: `${s.city}, ${s.state}`,
          href: `/stores/${s.id}`,
        });
      }
      for (const city of data.cities || []) {
        items.push({
          type: "city",
          label: city,
          href: `/stores?q=${encodeURIComponent(city)}`,
        });
      }
      for (const cat of data.categories || []) {
        items.push({
          type: "category",
          label: cat.name,
          href: `/category/${cat.id}`,
        });
      }

      setSuggestions(items);
      setShowSuggestions(items.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-dismiss location error
  useEffect(() => {
    if (!locError) return;
    const t = setTimeout(() => setLocError(""), 3000);
    return () => clearTimeout(t);
  }, [locError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/stores?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (href: string) => {
    setShowSuggestions(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex].href);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        router.push(`/stores?near=${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => {
        setLocating(false);
        setLocError("Location unavailable");
      },
      { timeout: 8000 }
    );
  };

  const typeLabel: Record<string, string> = {
    store: "Store",
    city: "City",
    category: "Category",
  };

  return (
    <div ref={wrapperRef} className="w-full relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search businesses by name, city, or category..."
            className={`w-full rounded-lg bg-white outline-none transition ${
              large
                ? "pl-6 pr-32 py-4 text-lg"
                : "pl-4 pr-28 py-3"
            }`}
            style={{
              border: "1px solid var(--eco-border)",
              color: "var(--eco-charcoal)",
            }}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
          />

          {/* Near Me button */}
          <button
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            title="Find stores near me"
            className={`absolute flex items-center justify-center rounded-lg transition ${
              large
                ? "top-2 right-24 w-10 h-10"
                : "top-1.5 right-20 w-9 h-9"
            }`}
            style={{
              background: "var(--eco-mist)",
              color: "var(--eco-sage)",
            }}
          >
            {locating ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>

          {/* Search button */}
          <button
            type="submit"
            className={`absolute rounded-lg font-medium transition ${
              large ? "top-2 right-2 px-6 py-2" : "top-1.5 right-1.5 px-4 py-1.5"
            }`}
            style={{
              background: "var(--eco-forest)",
              color: "var(--eco-cream)",
            }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Location error */}
      {locError && (
        <div
          className="absolute top-full mt-1 left-0 text-sm px-3 py-1.5 rounded-lg"
          style={{ background: "var(--eco-mist)", color: "var(--eco-terracotta)" }}
        >
          {locError}
        </div>
      )}

      {/* Autocomplete dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50"
          style={{
            background: "white",
            border: "1px solid var(--eco-border)",
          }}
          role="listbox"
        >
          {suggestions.map((item, i) => (
            <button
              key={`${item.type}-${item.label}-${i}`}
              type="button"
              role="option"
              aria-selected={i === activeIndex}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                i === activeIndex ? "" : ""
              }`}
              style={{
                background: i === activeIndex ? "var(--eco-mist)" : "white",
                color: "var(--eco-charcoal)",
                borderBottom: i < suggestions.length - 1 ? "1px solid var(--eco-border)" : "none",
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item.href);
              }}
            >
              {/* Icon per type */}
              <span style={{ color: "var(--eco-warm-gray)" }}>
                {item.type === "store" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
                  </svg>
                )}
                {item.type === "city" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                )}
                {item.type === "category" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                )}
              </span>

              <div className="flex-1 min-w-0">
                <div className="truncate">{item.label}</div>
                {item.sub && (
                  <div className="text-xs truncate" style={{ color: "var(--eco-warm-gray)" }}>
                    {item.sub}
                  </div>
                )}
              </div>

              <span
                className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full"
                style={{ background: "var(--eco-mist)", color: "var(--eco-warm-gray)" }}
              >
                {typeLabel[item.type]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
