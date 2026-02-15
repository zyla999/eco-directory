import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// PATCH /api/admin/stores/[id] — update a store
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { store, locations } = await request.json();

    if (!store) {
      return NextResponse.json({ error: "Store data is required." }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("stores")
      .update(store)
      .eq("id", id);

    if (dbError) {
      console.error("Admin update store error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Replace additional locations: delete all then re-insert
    if (locations !== undefined) {
      await supabaseAdmin.from("store_locations").delete().eq("store_id", id);

      if (locations.length > 0) {
        const { error: locError } = await supabaseAdmin
          .from("store_locations")
          .insert(locations);
        if (locError) {
          console.error("Admin update store locations error:", locError);
          return NextResponse.json(
            { error: `Store saved but locations failed: ${locError.message}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
