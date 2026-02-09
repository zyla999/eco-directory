import { cache } from "react";
import { Store, Category, Sponsor, AdPlacement } from "@/types/store";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ── Row → TypeScript transformers ──

function transformStore(row: any): Store {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    shortDescription: row.short_description ?? undefined,
    categories: row.categories || [],
    tags: row.tags ?? undefined,
    type: row.type,
    logo: row.logo ?? undefined,
    logoAlt: row.logo_alt ?? undefined,
    image: row.image_src
      ? { src: row.image_src, alt: row.image_alt, credit: row.image_credit }
      : undefined,
    website: row.website ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    instagram: row.instagram ?? undefined,
    facebook: row.facebook ?? undefined,
    twitter: row.twitter ?? undefined,
    tiktok: row.tiktok ?? undefined,
    location: {
      address: row.address ?? undefined,
      city: row.city,
      state: row.state,
      country: row.country,
      region: row.region ?? undefined,
      postalCode: row.postal_code ?? undefined,
      coordinates:
        row.lat != null && row.lng != null
          ? { lat: row.lat, lng: row.lng }
          : undefined,
    },
    featured: row.featured ?? undefined,
    sponsored: row.sponsored ?? undefined,
    sponsorId: row.sponsor_id ?? undefined,
    priority: row.priority ?? undefined,
    shipsTo: row.ships_to ?? undefined,
    serviceArea: row.service_area ?? undefined,
    hours: row.hours ?? undefined,
    priceLevel: row.price_level ?? undefined,
    features: row.features ?? undefined,
    offersWholesale: row.offers_wholesale ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    lastVerifiedAt: row.last_verified_at,
    source: row.source ?? undefined,
    status: row.status,
    reviewNotes: row.review_notes ?? undefined,
  };
}

function transformSponsor(row: any): Sponsor {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    logo: row.logo,
    website: row.website,
    cta: row.cta,
    placement: row.placement || [],
    targetCategories: row.target_categories ?? undefined,
    targetStates: row.target_states ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
  };
}

// ── Store queries ──

export const getAllStores = cache(async (): Promise<Store[]> => {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("status", "active")
    .order("name");

  if (error) {
    console.error("getAllStores error:", error);
    return [];
  }
  return (data || []).map(transformStore);
});

export const getStoreById = cache(async (id: string): Promise<Store | undefined> => {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return transformStore(data);
});

export const getStoresByCategory = cache(async (category: string): Promise<Store[]> => {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("status", "active")
    .contains("categories", [category])
    .order("name");

  if (error) {
    console.error("getStoresByCategory error:", error);
    return [];
  }
  return (data || []).map(transformStore);
});

export const getStoresByState = cache(async (state: string): Promise<Store[]> => {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("status", "active")
    .ilike("state", state)
    .order("name");

  if (error) {
    console.error("getStoresByState error:", error);
    return [];
  }
  return (data || []).map(transformStore);
});

export const getStoresByCity = cache(async (city: string): Promise<Store[]> => {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("status", "active")
    .ilike("city", city)
    .order("name");

  if (error) return [];
  return (data || []).map(transformStore);
});

export const getStoresByCountry = cache(async (country: "USA" | "Canada"): Promise<Store[]> => {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("status", "active")
    .eq("country", country)
    .order("name");

  if (error) return [];
  return (data || []).map(transformStore);
});

export const searchStores = cache(async (query: string): Promise<Store[]> => {
  const pattern = `%${query}%`;
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("status", "active")
    .or(`name.ilike.${pattern},description.ilike.${pattern},city.ilike.${pattern},state.ilike.${pattern}`)
    .order("name");

  if (error) {
    console.error("searchStores error:", error);
    return [];
  }
  return (data || []).map(transformStore);
});

// ── Category queries ──

export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("getCategories error:", error);
    return [];
  }
  return (data || []) as Category[];
});

// ── Derived helpers ──

export const getUniqueStates = cache(async (): Promise<string[]> => {
  const stores = await getAllStores();
  const states = new Set(stores.map((s) => s.location.state));
  return Array.from(states).sort();
});

export const getUniqueCities = cache(async (): Promise<string[]> => {
  const stores = await getAllStores();
  const cities = new Set(stores.map((s) => s.location.city));
  return Array.from(cities).sort();
});

export const getStoreStats = cache(async () => {
  const stores = await getAllStores();
  const categories = await getCategories();

  return {
    totalStores: stores.length,
    totalCategories: categories.length,
    totalStates: new Set(stores.map((s) => s.location.state)).size,
    totalCities: new Set(stores.map((s) => s.location.city)).size,
    byCountry: {
      USA: stores.filter((s) => s.location.country === "USA").length,
      Canada: stores.filter((s) => s.location.country === "Canada").length,
    },
  };
});

// ── Sponsor helpers ──

export const getSponsors = cache(async (): Promise<Sponsor[]> => {
  const { data, error } = await supabaseAdmin
    .from("sponsors")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("getSponsors error:", error);
    return [];
  }
  return (data || []).map(transformSponsor);
});

export async function getSponsorsByPlacement(placement: AdPlacement): Promise<Sponsor[]> {
  const sponsors = await getSponsors();
  return sponsors.filter((s) => s.placement.includes(placement));
}

export async function getSponsorForCategory(category: string): Promise<Sponsor | undefined> {
  const sponsors = await getSponsors();
  return sponsors.find(
    (s) =>
      s.placement.includes("category-sidebar") &&
      (!s.targetCategories || s.targetCategories.includes(category as any))
  );
}

export async function getSponsorForState(state: string): Promise<Sponsor | undefined> {
  const sponsors = await getSponsors();
  return sponsors.find(
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

export const getStatesWithStores = cache(async (): Promise<StateInfo[]> => {
  const allStores = await getAllStores();
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

  return Array.from(stateMap.entries())
    .map(([stateCode, info]) => {
      const prefix = countryForState(stateCode);
      return {
        slug: `${prefix}-${stateCode.toLowerCase()}`,
        stateCode,
        stateName: STATE_NAMES[stateCode] || stateCode,
        country: info.country,
        storeCount: info.count,
      };
    })
    .sort((a, b) => a.stateName.localeCompare(b.stateName));
});

export async function getStoresByStateSlug(slug: string): Promise<Store[]> {
  const parts = slug.split("-");
  if (parts.length < 2) return [];
  const stateCode = parts.slice(1).join("-").toUpperCase();
  return getStoresByState(stateCode);
}
