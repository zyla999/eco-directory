import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, description, categories, type, website, email, phone, address, city, state, country, postalCode, instagram, facebook } = body;

    if (!name || !description || !categories || categories.length === 0) {
      return NextResponse.json(
        { error: "Name, description, and at least one category are required." },
        { status: 400 }
      );
    }

    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${(city || "online").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    const { error } = await supabaseAdmin.from("stores").insert({
      id,
      name,
      description,
      categories,
      type: type || "brick-and-mortar",
      website: website || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || "",
      state: state || "",
      country: country || "USA",
      postal_code: postalCode || null,
      instagram: instagram || null,
      facebook: facebook || null,
      status: "needs-review",
      source: "public-submission",
    });

    if (error) {
      console.error("Submit store error:", error);
      return NextResponse.json(
        { error: "Failed to submit business. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
