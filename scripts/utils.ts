import fs from "fs";
import path from "path";
import { Store } from "../src/types/store";

const dataDir = path.join(process.cwd(), "data");
const storesDir = path.join(dataDir, "stores");

export function getAllStores(): Store[] {
  const storeFiles = fs
    .readdirSync(storesDir)
    .filter((f) => f.endsWith(".json"));
  const allStores: Store[] = [];

  for (const file of storeFiles) {
    const filePath = path.join(storesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const stores: Store[] = JSON.parse(content);
    allStores.push(...stores);
  }

  return allStores;
}

export function getStoreFile(store: Store): string {
  const country = store.location.country === "USA" ? "usa" : "can";
  const state = store.location.state.toLowerCase();

  if (store.type === "online") {
    return "online.json";
  }

  return `${country}-${state}.json`;
}

export function addStore(store: Store): void {
  const filename = getStoreFile(store);
  const filePath = path.join(storesDir, filename);

  let stores: Store[] = [];
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    stores = JSON.parse(content);
  }

  // Check for duplicates
  if (stores.some((s) => s.id === store.id)) {
    console.log(`Store ${store.id} already exists, skipping`);
    return;
  }

  stores.push(store);
  fs.writeFileSync(filePath, JSON.stringify(stores, null, 2));
  console.log(`Added store: ${store.name} to ${filename}`);
}

export function updateStore(storeId: string, updates: Partial<Store>): void {
  const allStores = getAllStores();
  const store = allStores.find((s) => s.id === storeId);

  if (!store) {
    console.log(`Store ${storeId} not found`);
    return;
  }

  const filename = getStoreFile(store);
  const filePath = path.join(storesDir, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  let stores: Store[] = JSON.parse(content);

  stores = stores.map((s) => (s.id === storeId ? { ...s, ...updates } : s));

  fs.writeFileSync(filePath, JSON.stringify(stores, null, 2));
  console.log(`Updated store: ${storeId}`);
}

export function generateStoreId(name: string, city: string): string {
  const slug = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug;
}

export async function checkWebsite(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}
