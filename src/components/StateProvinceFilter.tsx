"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StateInfo {
  slug: string;
  stateCode: string;
  stateName: string;
  country: string;
  storeCount: number;
}

interface Props {
  statesWithStores: StateInfo[];
  selectedStates: string[];
  baseParams: Record<string, string>;
}

export default function StateProvinceFilter({
  statesWithStores,
  selectedStates,
  baseParams,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedStates));

  const canadianStates = statesWithStores.filter((s) => s.country === "Canada");
  const usStates = statesWithStores.filter((s) => s.country === "USA");

  function navigate(newSelected: Set<string>) {
    const params = new URLSearchParams(baseParams);
    if (newSelected.size > 0) {
      params.set("state", Array.from(newSelected).sort().join(","));
    }
    const qs = params.toString();
    router.push(`/stores${qs ? `?${qs}` : ""}`);
  }

  function toggleState(code: string) {
    const next = new Set(selected);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setSelected(next);
    navigate(next);
  }

  function selectAllCountry(states: StateInfo[]) {
    const next = new Set(selected);
    states.forEach((s) => next.add(s.stateCode));
    setSelected(next);
    navigate(next);
  }

  function clearCountry(states: StateInfo[]) {
    const next = new Set(selected);
    states.forEach((s) => next.delete(s.stateCode));
    setSelected(next);
    navigate(next);
  }

  function clearAll() {
    setSelected(new Set());
    navigate(new Set());
  }

  const hasAnySelected = selected.size > 0;
  const hasCanadianSelected = canadianStates.some((s) => selected.has(s.stateCode));
  const hasUSSelected = usStates.some((s) => selected.has(s.stateCode));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">State/Province</h4>
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
        <p className="text-sm text-green-600 font-medium mb-2">All Locations</p>
      )}

      {/* Canada */}
      {canadianStates.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => selectAllCountry(canadianStates)}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-green-600"
            >
              Canada
            </button>
            {hasCanadianSelected && (
              <button
                onClick={() => clearCountry(canadianStates)}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {canadianStates.map((si) => (
              <div key={si.stateCode} className="flex items-center justify-between">
                <button
                  onClick={() => toggleState(si.stateCode)}
                  className={`flex items-center gap-2 text-sm ${
                    selected.has(si.stateCode)
                      ? "text-green-600 font-medium"
                      : "text-gray-600 hover:text-green-600"
                  }`}
                >
                  <span
                    className={`inline-block w-3.5 h-3.5 rounded border flex-shrink-0 ${
                      selected.has(si.stateCode)
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selected.has(si.stateCode) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {si.stateName}
                </button>
                <a
                  href={`/location/${si.slug}`}
                  className="text-xs text-gray-400 hover:text-green-600"
                  title={`View all businesses in ${si.stateName}`}
                >
                  View page
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* US */}
      {usStates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => selectAllCountry(usStates)}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-green-600"
            >
              United States
            </button>
            {hasUSSelected && (
              <button
                onClick={() => clearCountry(usStates)}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {usStates.map((si) => (
              <div key={si.stateCode} className="flex items-center justify-between">
                <button
                  onClick={() => toggleState(si.stateCode)}
                  className={`flex items-center gap-2 text-sm ${
                    selected.has(si.stateCode)
                      ? "text-green-600 font-medium"
                      : "text-gray-600 hover:text-green-600"
                  }`}
                >
                  <span
                    className={`inline-block w-3.5 h-3.5 rounded border flex-shrink-0 ${
                      selected.has(si.stateCode)
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selected.has(si.stateCode) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {si.stateName}
                </button>
                <a
                  href={`/location/${si.slug}`}
                  className="text-xs text-gray-400 hover:text-green-600"
                  title={`View all businesses in ${si.stateName}`}
                >
                  View page
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
