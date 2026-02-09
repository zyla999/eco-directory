export type StoreCategory =
  | "refillery"
  | "bulk-foods"
  | "zero-waste"
  | "thrift-consignment"
  | "farmers-market"
  | "manufacturer"
  | "wholesale"
  | "service-provider";

export type StoreType = "brick-and-mortar" | "online" | "both";

export type StoreStatus = "active" | "needs-review" | "closed";

export type AdPlacement = "homepage-featured" | "category-sidebar" | "state-banner";

export interface Sponsor {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  cta: string;
  placement: AdPlacement[];
  targetCategories?: StoreCategory[];
  targetStates?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface StoreLocation {
  address?: string;
  city: string;
  state: string;
  country: "USA" | "Canada";
  region?: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface StoreImage {
  src: string;
  alt?: string;
  credit?: string;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  categories: StoreCategory[];
  tags?: string[];
  type: StoreType;
  logo?: string;
  logoAlt?: string;
  image?: StoreImage;
  website?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  location: StoreLocation;
  featured?: boolean;
  sponsored?: boolean;
  sponsorId?: string;
  priority?: number;
  shipsTo?: string[];
  serviceArea?: string[];
  hours?: string;
  priceLevel?: number;
  features?: string[];
  createdAt: string;
  updatedAt?: string;
  lastVerifiedAt: string;
  source?: string;
  status: StoreStatus;
  reviewNotes?: string;
}

export interface Category {
  id: StoreCategory;
  name: string;
  description: string;
  icon: string;
}
