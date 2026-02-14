import { StoreCategory } from "@/types/store";

export const categoryColors: Record<StoreCategory | string, string> = {
  refillery: "bg-blue-100 text-blue-800",
  "bulk-foods": "bg-amber-100 text-amber-800",
  "zero-waste": "bg-emerald-100 text-emerald-800",
  "thrift-consignment": "bg-purple-100 text-purple-800",
  "farmers-market": "bg-orange-100 text-orange-800",
  manufacturer: "bg-indigo-100 text-indigo-800",
  wholesale: "bg-teal-100 text-teal-800",
  "service-provider": "bg-rose-100 text-rose-800",
  apothecary: "bg-lime-100 text-lime-800",
};

// Saturated hex colors for map pins
export const categoryPinColors: Record<StoreCategory | string, string> = {
  refillery: "#2563eb",
  "bulk-foods": "#d97706",
  "zero-waste": "#059669",
  "thrift-consignment": "#7c3aed",
  "farmers-market": "#ea580c",
  manufacturer: "#4f46e5",
  wholesale: "#0d9488",
  "service-provider": "#e11d48",
  apothecary: "#65a30d",
};

// Human-readable category labels for legends
export const categoryLabels: Record<StoreCategory | string, string> = {
  refillery: "Refillery",
  "bulk-foods": "Bulk Foods",
  "zero-waste": "Zero Waste",
  "thrift-consignment": "Thrift & Consignment",
  "farmers-market": "Farmers Market",
  manufacturer: "Manufacturer",
  wholesale: "Wholesale",
  "service-provider": "Service Provider",
  apothecary: "Apothecary",
};

export const categoryIcons: Record<string, string> = {
  droplet: "💧",
  wheat: "🌾",
  recycle: "♻️",
  shirt: "👕",
  store: "🏪",
  factory: "🏭",
  truck: "🚛",
  briefcase: "💼",
};
