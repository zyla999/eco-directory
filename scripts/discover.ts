/**
 * Store Discovery Agent
 *
 * This script searches for new eco-friendly businesses to add to the directory.
 * It uses web search APIs to find potential stores and extracts their information.
 *
 * Prerequisites:
 * - Set SERPAPI_KEY environment variable for search functionality
 *
 * Run: npx ts-node scripts/discover.ts
 */

import { getAllStores, addStore, generateStoreId, formatDate } from "./utils";
import { Store, StoreCategory } from "../src/types/store";

// Search queries to find eco-friendly businesses
const SEARCH_QUERIES = [
  "refillery shop",
  "bulk food store sustainable",
  "eco-friendly store",
  "package free shop",
  "sustainable grocery store",
  "eco-friendly manufacturer",
  "sustainable brand manufacturer",
  "wholesale eco-friendly products distributor",
  "sustainability consulting service",
  "green cleaning service",
  "eco logistics provider",
];

// Target cities for discovery
const TARGET_CITIES = [
  { city: "Portland", state: "OR", country: "USA" as const },
  { city: "Seattle", state: "WA", country: "USA" as const },
  { city: "San Francisco", state: "CA", country: "USA" as const },
  { city: "Los Angeles", state: "CA", country: "USA" as const },
  { city: "New York", state: "NY", country: "USA" as const },
  { city: "Austin", state: "TX", country: "USA" as const },
  { city: "Denver", state: "CO", country: "USA" as const },
  { city: "Chicago", state: "IL", country: "USA" as const },
  { city: "Vancouver", state: "BC", country: "Canada" as const },
  { city: "Toronto", state: "ON", country: "Canada" as const },
  { city: "Montreal", state: "QC", country: "Canada" as const },
];

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

async function searchStores(
  query: string,
  location: string
): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.log(
      "⚠️  SERPAPI_KEY not set. Using mock data for demonstration."
    );
    return [];
  }

  try {
    const searchQuery = `${query} ${location}`;
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      searchQuery
    )}&api_key=${apiKey}&num=10`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.organic_results) {
      return data.organic_results.map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }));
    }
  } catch (error) {
    console.error(`Error searching for "${query} ${location}":`, error);
  }

  return [];
}

function categorizeStore(description: string): StoreCategory[] {
  const categories: StoreCategory[] = [];
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes("refill") || lowerDesc.includes("byoc")) {
    categories.push("refillery");
  }
  if (lowerDesc.includes("bulk") || lowerDesc.includes("grocery")) {
    categories.push("bulk-foods");
  }
  if (
    lowerDesc.includes("sustainable") ||
    lowerDesc.includes("eco") ||
    lowerDesc.includes("green")
  ) {
    categories.push("zero-waste");
  }
  if (
    lowerDesc.includes("thrift") ||
    lowerDesc.includes("secondhand") ||
    lowerDesc.includes("consignment")
  ) {
    categories.push("thrift-consignment");
  }
  if (
    lowerDesc.includes("manufacturer") ||
    lowerDesc.includes("brand") ||
    lowerDesc.includes("makes") ||
    lowerDesc.includes("produces")
  ) {
    categories.push("manufacturer");
  }
  if (
    lowerDesc.includes("wholesale") ||
    lowerDesc.includes("distributor") ||
    lowerDesc.includes("b2b") ||
    lowerDesc.includes("supplier")
  ) {
    categories.push("wholesale");
  }
  if (
    lowerDesc.includes("consulting") ||
    lowerDesc.includes("service") ||
    lowerDesc.includes("logistics") ||
    lowerDesc.includes("cleaning service")
  ) {
    categories.push("service-provider");
  }

  // Default to zero-waste if no specific category matched
  if (categories.length === 0) {
    categories.push("zero-waste");
  }

  return categories;
}

function isExistingStore(stores: Store[], url: string, name: string): boolean {
  const normalizedUrl = url.toLowerCase().replace(/^https?:\/\/(www\.)?/, "");
  const normalizedName = name.toLowerCase();

  return stores.some((store) => {
    const storeUrl = (store.website || "")
      .toLowerCase()
      .replace(/^https?:\/\/(www\.)?/, "");
    const storeName = store.name.toLowerCase();

    return storeUrl === normalizedUrl || storeName === normalizedName;
  });
}

function countryToRegionPrefix(country: "USA" | "Canada"): string {
  return country === "Canada" ? "can" : "usa";
}

async function discoverStores() {
  console.log("Starting business discovery...\n");

  const existingStores = getAllStores();
  console.log(`Existing businesses in database: ${existingStores.length}\n`);

  let newStoresFound = 0;

  for (const location of TARGET_CITIES) {
    const locationStr = `${location.city}, ${location.state}`;
    console.log(`\n🔍 Searching in ${locationStr}...`);

    for (const query of SEARCH_QUERIES) {
      const results = await searchStores(query, locationStr);

      for (const result of results) {
        // Skip if already in database
        if (isExistingStore(existingStores, result.link, result.title)) {
          continue;
        }

        // Create a new store entry
        const store: Store = {
          id: generateStoreId(result.title, location.city),
          name: result.title,
          description: result.snippet,
          categories: categorizeStore(result.snippet),
          type: "brick-and-mortar",
          website: result.link,
          location: {
            city: location.city,
            state: location.state,
            country: location.country,
            region: `${countryToRegionPrefix(location.country)}-${location.state.toLowerCase()}`,
          },
          createdAt: formatDate(),
          lastVerifiedAt: formatDate(),
          status: "needs-review", // New stores need review before going live
        };

        // Add to database (will skip duplicates)
        addStore(store);
        newStoresFound++;

        console.log(`  📍 Found: ${result.title}`);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n--- Discovery Summary ---");
  console.log(`New businesses found: ${newStoresFound}`);
  console.log(
    "\nNote: New businesses are added with status 'needs-review' and require manual approval."
  );
}

// Run if called directly
discoverStores().catch(console.error);
