export type StoreCategory =
  | "refillery"
  | "zero-waste"
  | "bulk-foods"
  | "sustainable-goods"
  | "thrift-consignment"
  | "farmers-market"
  | "online-only";

export type StoreType = "brick-and-mortar" | "online" | "both";

export type StoreStatus = "active" | "needs-review" | "closed";

export interface StoreLocation {
  address?: string;
  city: string;
  state: string;
  country: "USA" | "Canada";
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface StoreContact {
  email?: string;
  phone?: string;
}

export interface StoreSocial {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  categories: StoreCategory[];
  type: StoreType;
  logo?: string;
  website?: string;
  contact?: StoreContact;
  location: StoreLocation;
  social?: StoreSocial;
  addedDate: string;
  lastVerified: string;
  status: StoreStatus;
}

export interface Category {
  id: StoreCategory;
  name: string;
  description: string;
  icon: string;
}
