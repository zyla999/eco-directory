import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await sb.from("stores").select("id, name, type").eq("type", "both");
  if (!data || data.length === 0) {
    console.log("No stores with type 'both' found.");
    return;
  }

  console.log(`Found ${data.length} stores with type "both":\n`);
  for (const store of data) {
    console.log(`  ${store.name}: both → brick-and-mortar+online`);
    await sb.from("stores").update({ type: "brick-and-mortar+online" }).eq("id", store.id);
  }
  console.log("\nDone!");
}

main();
