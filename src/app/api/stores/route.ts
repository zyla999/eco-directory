import { NextResponse } from "next/server";
import { getAllStores } from "@/lib/stores";

export async function GET() {
  const stores = await getAllStores();
  return NextResponse.json(stores);
}
