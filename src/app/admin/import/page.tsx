"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ParsedRow {
  name: string;
  description: string;
  categories: string;
  type: string;
  website: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  [key: string]: string;
}

interface ImportResult {
  name: string;
  id: string;
  status: "ok" | "error";
  geocoded?: boolean;
  message?: string;
}

const PROVINCE_MAP: Record<string, string> = {
  AB: "Alberta", BC: "British Columbia", SK: "Saskatchewan",
  MB: "Manitoba", ON: "Ontario", QC: "Quebec", NB: "New Brunswick",
  NS: "Nova Scotia", PE: "Prince Edward Island", NL: "Newfoundland and Labrador",
  YT: "Yukon", NT: "Northwest Territories", NU: "Nunavut",
};

function normalizeForGeocode(address: string, state: string, country: string) {
  // Expand Canadian province abbreviations (Nominatim prefers full names)
  const expandedState = country === "Canada" ? (PROVINCE_MAP[state.toUpperCase()] || state) : state;

  // Remove unit/suite/apt numbers
  let cleaned = address.replace(/\b(unit|suite|apt|ste|#)\s*\S+/gi, "").trim();
  // Remove leading unit prefix like "103 2115..." → "2115..."
  cleaned = cleaned.replace(/^\d+\s+(?=\d)/, "");
  // Remove ordinal suffixes: "9th" → "9", "4th" → "4" (Nominatim prefers "9 Avenue" over "9th Avenue")
  cleaned = cleaned.replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");

  return { cleanedAddress: cleaned, expandedState };
}

async function geocodeQuery(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
    })}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "EcoDirectory/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

async function geocode(
  address: string,
  city: string,
  state: string,
  country: string
): Promise<{ lat: number; lng: number } | null> {
  if (!city && !state) return null;

  const { cleanedAddress, expandedState } = normalizeForGeocode(address, state, country);

  // Try progressively simpler queries, with 1.1s delay between each for rate limiting
  const queries = [
    [address, city, expandedState, country].filter(Boolean).join(", "),
    cleanedAddress !== address
      ? [cleanedAddress, city, expandedState, country].filter(Boolean).join(", ")
      : null,
    [city, expandedState, country].filter(Boolean).join(", "),
  ].filter(Boolean) as string[];

  // Deduplicate queries
  const seen = new Set<string>();
  const unique = queries.filter((q) => { if (seen.has(q)) return false; seen.add(q); return true; });

  for (const query of unique) {
    const result = await geocodeQuery(query);
    if (result) return result;
    await sleep(1100);
  }

  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: any = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

function makeId(name: string, city: string, address?: string): string {
  const slug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const base = `${slug(name)}-${slug(city || "online")}`;
  if (address) {
    // Extract street number or short identifier to disambiguate same-name-same-city stores
    const num = address.match(/^\d+/);
    if (num) return `${base}-${num[0]}`;
  }
  return base;
}

function parseCategories(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;|]/)
    .map((c) => c.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);
}

const EXPECTED_HEADERS = [
  "name", "description", "categories", "type", "website", "email", "phone",
  "instagram", "facebook", "twitter", "tiktok", "pinterest", "youtube", "linkedin",
  "address", "city", "state", "country", "postal_code", "offers_wholesale", "offers_local_delivery",
];

export default function ImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResults([]);
    setDone(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setImporting(true);
    setResults([]);
    setDone(false);

    const supabase = createClient();
    const importResults: ImportResult[] = [];

    for (const row of rows) {
      const name = row.name?.trim();
      if (!name) {
        importResults.push({ name: "(empty)", id: "", status: "error", message: "No name" });
        continue;
      }

      const city = row.city?.trim() || "";
      const address = row.address?.trim() || "";
      const id = makeId(name, city, address);
      const categories = parseCategories(row.categories || "");
      const validTypes = ["brick-and-mortar", "online", "both", "mobile"];
      const rawTypes = (row.type || "brick-and-mortar")
        .split(/[|,;+]/)
        .map((t: string) => t.trim().toLowerCase())
        .filter((t: string) => validTypes.includes(t));
      const type = rawTypes.length > 0 ? rawTypes.join("+") : "brick-and-mortar";
      const now = new Date().toISOString();

      const state = row.state?.trim() || "";
      const country = row.country?.trim() || "USA";

      // Geocode brick-and-mortar / both stores that have location info
      let lat: number | null = null;
      let lng: number | null = null;
      let geocoded = false;

      if (!type.startsWith("online") && (city || state)) {
        const coords = await geocode(address, city, state, country);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          geocoded = true;
        }
      }

      const store = {
        id,
        name,
        description: row.description?.trim() || null,
        categories,
        type,
        status: "needs-review" as const,
        website: row.website?.trim() || null,
        email: row.email?.trim() || null,
        phone: row.phone?.trim() || null,
        instagram: row.instagram?.trim() || null,
        facebook: row.facebook?.trim() || null,
        twitter: row.twitter?.trim() || null,
        tiktok: row.tiktok?.trim() || null,
        pinterest: row.pinterest?.trim() || null,
        youtube: row.youtube?.trim() || null,
        linkedin: row.linkedin?.trim() || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country,
        postal_code: row.postal_code?.trim() || null,
        lat,
        lng,
        offers_wholesale: row.offers_wholesale?.toLowerCase() === "true" || row.offers_wholesale === "1",
        offers_local_delivery: row.offers_local_delivery?.toLowerCase() === "true" || row.offers_local_delivery === "1",
        created_at: now,
        last_verified_at: now,
        source: "csv-import",
      };

      const { error } = await supabase.from("stores").upsert(store, { onConflict: "id" });

      if (error) {
        importResults.push({ name, id, status: "error", message: error.message });
      } else {
        importResults.push({ name, id, status: "ok", geocoded });
      }

      setResults([...importResults]);
    }

    setImporting(false);
    setDone(true);
  }

  const successCount = results.filter((r) => r.status === "ok").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const geocodedCount = results.filter((r) => r.geocoded).length;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">CSV Import</h1>
      <p className="text-gray-600 mb-6">
        Upload a CSV file to bulk import stores. Existing stores with the same ID will be updated.
      </p>

      {/* Expected format */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Expected CSV columns:</p>
        <div className="flex flex-wrap gap-1.5">
          {EXPECTED_HEADERS.map((h) => (
            <span
              key={h}
              className={`px-2 py-0.5 text-xs rounded font-mono ${
                h === "name" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
              }`}
            >
              {h}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Only <strong>name</strong> is required. Categories should be comma-separated (e.g. &quot;refillery, zero-waste&quot;).
          Type can be brick-and-mortar, online, or both. Country defaults to USA.
          Brick-and-mortar stores are automatically geocoded for the map (~1 sec per store).
        </p>
      </div>

      {/* Upload */}
      <div className="mb-6">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg px-8 py-6 w-full text-center hover:border-green-400 hover:bg-green-50 transition cursor-pointer"
        >
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-600">
            {fileName ? fileName : "Click to select a CSV file"}
          </span>
        </button>
      </div>

      {/* Preview */}
      {rows.length > 0 && !done && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-700 font-medium">
              Preview: {rows.length} {rows.length === 1 ? "store" : "stores"} found
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {importing ? `Importing & geocoding... (${results.length}/${rows.length})` : `Import ${rows.length} Stores`}
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">#</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Name</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Categories</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Type</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">City</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">State</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className={!row.name?.trim() ? "bg-red-50" : ""}>
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-900 font-medium">{row.name || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{row.categories || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{row.type || "brick-and-mortar"}</td>
                    <td className="px-3 py-2 text-gray-600">{row.city || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{row.state || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{row.country || "USA"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-6">
          {done && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
              errorCount === 0
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-yellow-50 border border-yellow-200 text-yellow-800"
            }`}>
              {errorCount === 0
                ? `All ${successCount} stores imported! (${geocodedCount} geocoded)`
                : `${successCount} imported (${geocodedCount} geocoded), ${errorCount} failed.`}
            </div>
          )}
          <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-60">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Status</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Name</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">ID</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Geocoded</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-medium">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">
                      {r.status === "ok" ? (
                        <span className="text-green-600">&#10003;</span>
                      ) : (
                        <span className="text-red-600">&#10007;</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-900">{r.name}</td>
                    <td className="px-3 py-2 text-gray-500 font-mono text-xs">{r.id}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.geocoded ? (
                        <span className="text-blue-600">&#128205;</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-red-600 text-xs">{r.message || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {done && (
            <button
              onClick={() => { setRows([]); setResults([]); setDone(false); setFileName(""); }}
              className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Import another file
            </button>
          )}
        </div>
      )}
    </div>
  );
}
