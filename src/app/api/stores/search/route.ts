import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ stores: [], cities: [], categories: [] });
  }

  const pattern = `%${q}%`;

  // Fetch matching stores (top 5)
  const { data: storeRows, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("id, name, city, state")
    .eq("status", "active")
    .ilike("name", pattern)
    .order("name")
    .limit(5);

  if (storeError) {
    console.error("Search API: store query failed", { query: q, error: storeError });
    return NextResponse.json(
      { stores: [], cities: [], categories: [], error: "Search failed" },
      { status: 500 }
    );
  }

  // Fetch matching cities (distinct, top 3)
  const { data: cityRows, error: cityError } = await supabaseAdmin
    .from("stores")
    .select("city")
    .eq("status", "active")
    .ilike("city", pattern)
    .order("city")
    .limit(20);

  if (cityError) {
    console.error("Search API: city query failed", { query: q, error: cityError });
    return NextResponse.json(
      { stores: [], cities: [], categories: [], error: "Search failed" },
      { status: 500 }
    );
  }

  const uniqueCities = [...new Set((cityRows || []).map((r: { city: string }) => r.city))].slice(0, 3);

  // Fetch matching categories
  const { data: catRows, error: catError } = await supabaseAdmin
    .from("categories")
    .select("id, name")
    .ilike("name", pattern)
    .limit(3);

  if (catError) {
    console.error("Search API: category query failed", { query: q, error: catError });
    return NextResponse.json(
      { stores: [], cities: [], categories: [], error: "Search failed" },
      { status: 500 }
    );
  }

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
