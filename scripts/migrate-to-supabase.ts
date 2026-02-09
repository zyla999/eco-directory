/**
 * One-time migration script: JSON files → Supabase
 *
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * to be set in .env.local (or environment).
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const dataDir = path.join(process.cwd(), "data");
const storesDir = path.join(dataDir, "stores");

// ── Migrate Categories ──

async function migrateCategories() {
  const filePath = path.join(dataDir, "categories.json");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const rows = raw.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description || "",
    icon: c.icon || "",
  }));

  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Error migrating categories:", error);
  } else {
    console.log(`Migrated ${rows.length} categories`);
  }
}

// ── Migrate Sponsors ──

async function migrateSponsors() {
  const filePath = path.join(dataDir, "sponsors.json");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const rows = raw.map((s: any) => ({
    id: s.id,
    name: s.name,
    description: s.description || "",
    logo: s.logo || null,
    website: s.website || null,
    cta: s.cta || null,
    placement: s.placement || [],
    target_categories: s.targetCategories || [],
    target_states: s.targetStates || [],
    start_date: s.startDate || null,
    end_date: s.endDate || null,
    is_active: s.isActive ?? true,
  }));

  const { error } = await supabase.from("sponsors").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Error migrating sponsors:", error);
  } else {
    console.log(`Migrated ${rows.length} sponsors`);
  }
}

// ── Migrate Stores ──

async function migrateStores() {
  const storeFiles = fs.readdirSync(storesDir).filter((f) => f.endsWith(".json"));
  let total = 0;

  for (const file of storeFiles) {
    const filePath = path.join(storesDir, file);
    const raw: any[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const rows = raw.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description || null,
      short_description: s.shortDescription || null,
      categories: s.categories || [],
      tags: s.tags || [],
      type: s.type || "brick-and-mortar",
      logo: s.logo || null,
      logo_alt: s.logoAlt || null,
      image_src: s.image?.src || null,
      image_alt: s.image?.alt || null,
      image_credit: s.image?.credit || null,
      website: s.website || null,
      email: s.email || null,
      phone: s.phone || null,
      instagram: s.instagram || null,
      facebook: s.facebook || null,
      twitter: s.twitter || null,
      tiktok: s.tiktok || null,
      address: s.location?.address || null,
      city: s.location?.city || "",
      state: s.location?.state || "",
      country: s.location?.country || "USA",
      region: s.location?.region || null,
      postal_code: s.location?.postalCode || null,
      lat: s.location?.coordinates?.lat || null,
      lng: s.location?.coordinates?.lng || null,
      featured: s.featured || false,
      sponsored: s.sponsored || false,
      sponsor_id: s.sponsorId || null,
      priority: s.priority || 0,
      ships_to: s.shipsTo || [],
      service_area: s.serviceArea || [],
      hours: s.hours || null,
      price_level: s.priceLevel || null,
      features: s.features || [],
      created_at: s.createdAt || new Date().toISOString(),
      updated_at: s.updatedAt || s.createdAt || new Date().toISOString(),
      last_verified_at: s.lastVerifiedAt || new Date().toISOString(),
      source: s.source || null,
      status: s.status || "active",
      review_notes: s.reviewNotes || null,
    }));

    const { error } = await supabase.from("stores").upsert(rows, { onConflict: "id" });
    if (error) {
      console.error(`Error migrating ${file}:`, error);
    } else {
      console.log(`Migrated ${rows.length} stores from ${file}`);
      total += rows.length;
    }
  }

  console.log(`Total stores migrated: ${total}`);
}

// ── Main ──

async function main() {
  console.log("Starting migration to Supabase...\n");

  await migrateCategories();
  await migrateSponsors();
  await migrateStores();

  console.log("\nMigration complete!");
}

main().catch(console.error);
