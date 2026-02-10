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

const CATEGORY_MAP: Record<string, string> = {
  "sustainable-goods": "zero-waste",
  "sustainable": "zero-waste",
};

async function main() {
  // Find stores with empty categories
  const { data } = await sb.from("stores").select("id, name, categories");
  if (!data) return;

  const empty = data.filter((s) => !s.categories || s.categories.length === 0);
  console.log(`Found ${empty.length} stores with empty categories\n`);

  for (const store of empty) {
    // These are likely refillery stores based on name - assign refillery + zero-waste
    const cats: string[] = [];

    const nameLower = store.name.toLowerCase();
    if (nameLower.includes("refill") || nameLower.includes("refinery") || nameLower.includes("refillery")) {
      cats.push("refillery");
    }
    if (nameLower.includes("bulk") || nameLower.includes("pantry") || nameLower.includes("kitchen") || nameLower.includes("market")) {
      cats.push("bulk-foods");
    }
    if (nameLower.includes("thrift") || nameLower.includes("consignment")) {
      cats.push("thrift-consignment");
    }
    // Default: at least zero-waste for eco stores
    if (!cats.includes("zero-waste")) {
      cats.push("zero-waste");
    }

    console.log(`${store.name}: [] → [${cats.join(", ")}]`);
    await sb.from("stores").update({ categories: cats }).eq("id", store.id);
  }

  console.log(`\nFixed ${empty.length} stores.`);
}

main();
