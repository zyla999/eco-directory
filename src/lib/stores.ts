import fs from "fs";
import path from "path";
import { Store, Category, Sponsor, AdPlacement } from "@/types/store";

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

// ── Sponsor helpers ──

export function getSponsors(): Sponsor[] {
  const filePath = path.join(dataDir, "sponsors.json");
  const content = fs.readFileSync(filePath, "utf-8");
  const sponsors: Sponsor[] = JSON.parse(content);
  return sponsors.filter((s) => s.isActive);
}

export function getSponsorsByPlacement(placement: AdPlacement): Sponsor[] {
  return getSponsors().filter((s) => s.placement.includes(placement));
}

export function getSponsorForCategory(category: string): Sponsor | undefined {
  return getSponsors().find(
    (s) =>
      s.placement.includes("category-sidebar") &&
      (!s.targetCategories || s.targetCategories.includes(category as any))
  );
}

export function getSponsorForState(state: string): Sponsor | undefined {
  return getSponsors().find(
    (s) =>
      s.placement.includes("state-banner") &&
      (!s.targetStates || s.targetStates.includes(state))
  );
}

// ── State/Province helpers ──

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  // Canadian provinces
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories",
  NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon",
};

function countryForState(stateCode: string): string {
  const canadianProvinces = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];
  return canadianProvinces.includes(stateCode) ? "can" : "usa";
}

export interface StateInfo {
  slug: string;
  stateCode: string;
  stateName: string;
  country: string;
  storeCount: number;
}

export function getStatesWithStores(): StateInfo[] {
  const allStores = getAllStores();
  const stateMap = new Map<string, { country: "USA" | "Canada"; count: number }>();

  for (const store of allStores) {
    const code = store.location.state;
    const existing = stateMap.get(code);
    if (existing) {
      existing.count++;
    } else {
      stateMap.set(code, { country: store.location.country, count: 1 });
    }
  }

  return Array.from(stateMap.entries()).map(([stateCode, info]) => {
    const prefix = countryForState(stateCode);
    return {
      slug: `${prefix}-${stateCode.toLowerCase()}`,
      stateCode,
      stateName: STATE_NAMES[stateCode] || stateCode,
      country: info.country,
      storeCount: info.count,
    };
  }).sort((a, b) => a.stateName.localeCompare(b.stateName));
}

export function getStoresByStateSlug(slug: string): Store[] {
  // slug format: "usa-ca", "can-on"
  const parts = slug.split("-");
  if (parts.length < 2) return [];
  const stateCode = parts.slice(1).join("-").toUpperCase();
  return getStoresByState(stateCode);
}
