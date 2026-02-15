import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ stores: [], cities: [], categories: [] });
  }

  const pattern = `%${q}%`;

  // Fetch matching stores (top 5)
  const { data: storeRows } = await supabaseAdmin
    .from("stores")
    .select("id, name, city, state")
    .eq("status", "active")
    .ilike("name", pattern)
    .order("name")
    .limit(5);

  // Fetch matching cities (distinct, top 3)
  const { data: cityRows } = await supabaseAdmin
    .from("stores")
    .select("city")
    .eq("status", "active")
    .ilike("city", pattern)
    .order("city")
    .limit(20);

  const uniqueCities = [...new Set((cityRows || []).map((r: { city: string }) => r.city))].slice(0, 3);

  // Fetch matching categories
  const { data: catRows } = await supabaseAdmin
    .from("categories")
    .select("id, name")
    .ilike("name", pattern)
    .limit(3);

  return NextResponse.json({
    stores: (storeRows || []).map((r: { id: string; name: string; city: string; state: string }) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      state: r.state,
    })),
    cities: uniqueCities,
    categories: (catRows || []).map((r: { id: string; name: string }) => ({
      id: r.id,
      name: r.name,
    })),
  });
}
