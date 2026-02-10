import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_CATEGORIES = [
  "refillery", "bulk-foods", "zero-waste", "thrift-consignment",
  "farmers-market", "manufacturer", "wholesale", "service-provider",
];

// Map invalid categories to valid ones
const CATEGORY_MAP: Record<string, string> = {
  "sustainable-goods": "zero-waste",
  "sustainable": "zero-waste",
  "eco-friendly": "zero-waste",
  "bulk": "bulk-foods",
  "thrift": "thrift-consignment",
  "consignment": "thrift-consignment",
};

async function main() {
  const { data } = await sb.from("stores").select("id, name, categories");
  if (!data) return;

  let fixed = 0;
  for (const store of data) {
    const original = store.categories as string[];

    // First, split any entries that contain semicolons (from bad CSV parsing)
    const expanded = original.flatMap((cat) =>
      cat.includes(";") ? cat.split(/[;]/).map((c) => c.trim().replace(/^-/, "")) : [cat]
    );

    const cleaned = expanded.map((cat) => {
      const normalized = cat.trim().toLowerCase().replace(/\s+/g, "-");
      if (VALID_CATEGORIES.includes(normalized)) return normalized;
      if (CATEGORY_MAP[normalized]) return CATEGORY_MAP[normalized];
      return null;
    }).filter(Boolean) as string[];

    // Deduplicate
    const unique = [...new Set(cleaned)];

    if (JSON.stringify(original) !== JSON.stringify(unique)) {
      console.log(`${store.name}: [${original.join(", ")}] → [${unique.join(", ")}]`);
      await sb.from("stores").update({ categories: unique }).eq("id", store.id);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} stores.`);
}

main();
