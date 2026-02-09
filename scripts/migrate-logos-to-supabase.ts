import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "logos";
const LOGOS_DIR = path.join(__dirname, "..", "public", "logos");

async function main() {
  // 1. Check if bucket exists, create if not
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ["image/svg+xml", "image/png", "image/jpeg", "image/webp"],
      fileSizeLimit: 2 * 1024 * 1024, // 2MB
    });
    if (error) {
      console.error("Failed to create bucket:", error.message);
      return;
    }
    console.log("Created bucket:", BUCKET);
  } else {
    console.log("Bucket already exists:", BUCKET);
  }

  // 2. Read all logo files
  const files = fs.readdirSync(LOGOS_DIR).filter((f) => /\.(svg|png|jpg|jpeg|webp)$/i.test(f));
  console.log(`Found ${files.length} logo files`);

  // 3. Upload each file
  for (const file of files) {
    const filePath = path.join(LOGOS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);

    const ext = path.extname(file).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };

    const { error } = await supabase.storage.from(BUCKET).upload(file, fileBuffer, {
      contentType: mimeTypes[ext] || "application/octet-stream",
      upsert: true,
    });

    if (error) {
      console.error(`  Failed to upload ${file}:`, error.message);
    } else {
      console.log(`  Uploaded: ${file}`);
    }
  }

  // 4. Update store records with Supabase Storage URLs
  const { data: { publicUrl: baseUrl } } = supabase.storage.from(BUCKET).getPublicUrl("");
  // baseUrl ends with a slash or has the empty filename — we just need the prefix
  const urlPrefix = baseUrl.replace(/\/$/, "");

  const { data: stores, error: fetchErr } = await supabase.from("stores").select("id, logo");
  if (fetchErr) {
    console.error("Failed to fetch stores:", fetchErr.message);
    return;
  }

  let updated = 0;
  for (const store of stores || []) {
    if (!store.logo) continue;

    // Extract filename from path like /logos/bare-market-toronto.svg
    const filename = store.logo.replace(/^\/logos\//, "");
    if (!files.includes(filename)) {
      console.log(`  Skipping ${store.id} — logo file "${filename}" not found locally`);
      continue;
    }

    const newUrl = `${urlPrefix}/${filename}`;
    const { error: updateErr } = await supabase
      .from("stores")
      .update({ logo: newUrl })
      .eq("id", store.id);

    if (updateErr) {
      console.error(`  Failed to update ${store.id}:`, updateErr.message);
    } else {
      console.log(`  Updated ${store.id}: ${store.logo} → ${newUrl}`);
      updated++;
    }
  }

  console.log(`\nDone! Uploaded ${files.length} files, updated ${updated} store records.`);
}

main().catch(console.error);
