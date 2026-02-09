import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await sb.from("stores").select("id, city, state, country, address, type, lat, lng");
  if (!data) return;

  const noCoords = data.filter((s) => s.lat === null && s.type !== "online");
  const hasCoords = data.filter((s) => s.lat !== null);
  const online = data.filter((s) => s.type === "online");

  console.log("Total stores:", data.length);
  console.log("Have coordinates:", hasCoords.length);
  console.log("Online (no coords expected):", online.length);
  console.log("Missing coordinates (non-online):", noCoords.length);
  console.log("\nStores missing coords:");
  for (const s of noCoords) {
    console.log(" ", s.id, "|", [s.address, s.city, s.state, s.country].filter(Boolean).join(", "));
  }

  // Test geocoding one of them
  if (noCoords.length > 0) {
    const test = noCoords[0];
    const parts = [test.address, test.city, test.state, test.country].filter(Boolean).join(", ");
    console.log("\n--- Testing geocode for:", parts);
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: parts,
      format: "json",
      limit: "1",
    })}`;
    const res = await fetch(url, { headers: { "User-Agent": "EcoDirectory/1.0" } });
    const json = await res.json();
    console.log("Response:", JSON.stringify(json, null, 2));
  }
}

main();
