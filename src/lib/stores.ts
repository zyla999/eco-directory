import fs from "fs";
import path from "path";
import { Store, Category } from "@/types/store";

const dataDir = path.join(process.cwd(), "data");
const storesDir = path.join(dataDir, "stores");

export function getAllStores(): Store[] {
  const storeFiles = fs.readdirSync(storesDir).filter((f) => f.endsWith(".json"));
  const allStores: Store[] = [];

  for (const file of storeFiles) {
    const filePath = path.join(storesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const stores: Store[] = JSON.parse(content);
    allStores.push(...stores);
  }

  return allStores.filter((store) => store.status === "active");
}

export function getStoreById(id: string): Store | undefined {
  const allStores = getAllStores();
  return allStores.find((store) => store.id === id);
}

export function getStoresByCategory(category: string): Store[] {
  const allStores = getAllStores();
  return allStores.filter((store) => store.categories.includes(category as any));
}

export function getStoresByState(state: string): Store[] {
  const allStores = getAllStores();
  return allStores.filter(
    (store) => store.location.state.toLowerCase() === state.toLowerCase()
  );
}

export function getStoresByCity(city: string): Store[] {
  const allStores = getAllStores();
  return allStores.filter(
    (store) => store.location.city.toLowerCase() === city.toLowerCase()
  );
}

export function getStoresByCountry(country: "USA" | "Canada"): Store[] {
  const allStores = getAllStores();
  return allStores.filter((store) => store.location.country === country);
}

export function searchStores(query: string): Store[] {
  const allStores = getAllStores();
  const lowerQuery = query.toLowerCase();

  return allStores.filter(
    (store) =>
      store.name.toLowerCase().includes(lowerQuery) ||
      store.description.toLowerCase().includes(lowerQuery) ||
      store.location.city.toLowerCase().includes(lowerQuery) ||
      store.location.state.toLowerCase().includes(lowerQuery)
  );
}

export function getCategories(): Category[] {
  const filePath = path.join(dataDir, "categories.json");
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getUniqueStates(): string[] {
  const allStores = getAllStores();
  const states = new Set(allStores.map((store) => store.location.state));
  return Array.from(states).sort();
}

export function getUniqueCities(): string[] {
  const allStores = getAllStores();
  const cities = new Set(allStores.map((store) => store.location.city));
  return Array.from(cities).sort();
}

export function getStoreStats() {
  const allStores = getAllStores();
  const categories = getCategories();

  return {
    totalStores: allStores.length,
    totalCategories: categories.length,
    totalStates: getUniqueStates().length,
    totalCities: getUniqueCities().length,
    byCountry: {
      USA: allStores.filter((s) => s.location.country === "USA").length,
      Canada: allStores.filter((s) => s.location.country === "Canada").length,
    },
  };
}
