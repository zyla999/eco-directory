import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// POST /api/admin/stores — create a new store
export async function POST(request: Request) {
  try {
    const { store, locations } = await request.json();

    if (!store?.id || !store?.name) {
      return NextResponse.json({ error: "ID and name are required." }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin.from("stores").insert(store);

    if (dbError) {
      console.error("Admin create store error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Insert additional locations if provided
    if (locations && locations.length > 0) {
      const { error: locError } = await supabaseAdmin.from("store_locations").insert(locations);
      if (locError) {
        console.error("Admin create store locations error:", locError);
        return NextResponse.json(
          { error: `Store created but locations failed: ${locError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

// PATCH /api/admin/stores — bulk status update or delete
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("stores")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Admin update status error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

// DELETE /api/admin/stores?id=xxx
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    // Delete locations first (foreign key)
    await supabaseAdmin.from("store_locations").delete().eq("store_id", id);

    const { error } = await supabaseAdmin.from("stores").delete().eq("id", id);

    if (error) {
      console.error("Admin delete store error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
