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
