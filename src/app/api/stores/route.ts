import { NextResponse } from "next/server";
import { getAllStores, getAdditionalLocationsByStoreIds } from "@/lib/stores";

export async function GET() {
  const stores = await getAllStores();
  const ids = stores.map((s) => s.id);
  const additionalMap = await getAdditionalLocationsByStoreIds(ids);

  const enriched = stores.map((store) => {
    const additional = additionalMap[store.id];
    if (additional && additional.length > 0) {
      return { ...store, additionalLocations: additional };
    }
    return store;
  });

  return NextResponse.json(enriched);
}
