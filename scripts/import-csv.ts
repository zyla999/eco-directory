import * as dotenv from "dotenv";
import * as fs from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Usage ──
// npx tsx scripts/import-csv.ts path/to/businesses.csv
//
// ── Expected columns (first row = headers) ──
// name, description, categories, type, website, email, phone,
// instagram, facebook, twitter, tiktok,
// address, city, state, country, postal_code

function makeId(name: string, city: string, address?: string): string {
  const slug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const base = `${slug(name)}-${slug(city || "online")}`;
  if (address) {
    const num = address.match(/^\d+/);
    if (num) return `${base}-${num[0]}`;
  }
  return base;
}

function parseCategories(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]/)
    .map((c) => c.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/import-csv.ts <path/to/file.csv>");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const csv = fs.readFileSync(filePath, "utf-8");
  const rows: Record<string, string>[] = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log(`Found ${rows.length} rows in ${filePath}\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const name = row.name?.trim();
    if (!name) {
      console.log("  Skipping row with no name");
      skipped++;
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

    const store = {
      id,
      name,
      description: row.description?.trim() || null,
      categories,
      type,
      status: "active",
      website: row.website?.trim() || null,
      email: row.email?.trim() || null,
      phone: row.phone?.trim() || null,
      instagram: row.instagram?.trim() || null,
      facebook: row.facebook?.trim() || null,
      twitter: row.twitter?.trim() || null,
      tiktok: row.tiktok?.trim() || null,
      pinterest: row.pinterest?.trim() || null,
      address: row.address?.trim() || null,
      city: city || null,
      state: row.state?.trim() || null,
      country: row.country?.trim() || "USA",
      postal_code: row.postal_code?.trim() || null,
      offers_wholesale: row.offers_wholesale?.toLowerCase() === "true" || row.offers_wholesale === "1",
      created_at: now,
      last_verified_at: now,
      source: "csv-import",
    };

    const { error } = await supabase.from("stores").upsert(store, { onConflict: "id" });

    if (error) {
      console.error(`  Error: ${name} (${id}): ${error.message}`);
      errors++;
    } else {
      console.log(`  Imported: ${name} → ${id}`);
      created++;
    }
  }

  console.log(`\nDone! ${created} imported, ${skipped} skipped, ${errors} errors.`);
}

main().catch(console.error);
