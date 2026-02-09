import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  })}`;
  const res = await fetch(url, { headers: { "User-Agent": "EcoDirectory/1.0" } });
  const json = await res.json();
  if (json.length > 0) {
    return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
  }
  return null;
}

function normalizeAddress(addr: string): string {
  // Remove unit/suite/apt numbers
  let cleaned = addr.replace(/\b(unit|suite|apt|ste|#)\s*\S+/gi, "").trim();
  // Remove leading unit prefix like "103 2115..." → "2115..."
  cleaned = cleaned.replace(/^\d+\s+(?=\d)/, "");
  // Remove ordinal suffixes: "9th" → "9", "4th" → "4"
  cleaned = cleaned.replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");
  return cleaned;
}

function expandProvince(abbr: string): string {
  const map: Record<string, string> = {
    AB: "Alberta", BC: "British Columbia", SK: "Saskatchewan",
    MB: "Manitoba", ON: "Ontario", QC: "Quebec", NB: "New Brunswick",
    NS: "Nova Scotia", PE: "Prince Edward Island", NL: "Newfoundland and Labrador",
    YT: "Yukon", NT: "Northwest Territories", NU: "Nunavut",
  };
  return map[abbr.toUpperCase()] || abbr;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { data } = await sb.from("stores").select("id, address, city, state, country, type, lat, lng");
  if (!data) return;

  const missing = data.filter((s) => s.lat === null && s.type !== "online");
  console.log(`Found ${missing.length} stores missing coordinates\n`);

  for (const store of missing) {
    const state = store.country === "Canada" ? expandProvince(store.state) : store.state;

    // Try multiple strategies
    const strategies = [
      // 1. Full address as-is
      [store.address, store.city, state, store.country].filter(Boolean).join(", "),
      // 2. Normalized address (no unit, no ordinals)
      [normalizeAddress(store.address || ""), store.city, state, store.country].filter(Boolean).join(", "),
      // 3. City + state + country only
      [store.city, state, store.country].filter(Boolean).join(", "),
    ];

    let result: { lat: number; lng: number } | null = null;
    for (const query of strategies) {
      if (!query) continue;
      console.log(`  Trying: "${query}"`);
      result = await geocode(query);
      await sleep(1100);
      if (result) {
        console.log(`  ✓ Found: ${result.lat}, ${result.lng}`);
        break;
      }
    }

    if (result) {
      const { error } = await sb
        .from("stores")
        .update({ lat: result.lat, lng: result.lng })
        .eq("id", store.id);
      if (error) {
        console.log(`  ✗ DB error for ${store.id}: ${error.message}`);
      } else {
        console.log(`  ✓ Updated ${store.id}\n`);
      }
    } else {
      console.log(`  ✗ Could not geocode ${store.id}\n`);
    }
  }

  console.log("Done!");
}

main();
