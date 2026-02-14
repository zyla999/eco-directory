import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";

const NOTIFY_EMAIL = "zyla999@hotmail.com";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, description, categories, type, website, email, phone, address, city, state, country, postalCode, instagram, facebook, twitter, tiktok, pinterest, offersWholesale, offersLocalDelivery } = body;

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
      twitter: twitter || null,
      tiktok: tiktok || null,
      pinterest: pinterest || null,
      offers_wholesale: offersWholesale || false,
      offers_local_delivery: offersLocalDelivery || false,
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

    // Send email notification (don't block the response if it fails)
    const location = city && state ? `${city}, ${state}, ${country}` : "Online";
    const resend = getResend();
    resend?.emails.send({
      from: "Eco Directory <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `New Business Submission: ${name}`,
      html: `
        <h2>New Business Submission</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${name}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Type</td><td style="padding:6px 12px;">${type || "brick-and-mortar"}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Location</td><td style="padding:6px 12px;">${location}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Categories</td><td style="padding:6px 12px;">${categories.join(", ")}</td></tr>
          ${website ? `<tr><td style="padding:6px 12px;font-weight:bold;">Website</td><td style="padding:6px 12px;">${website}</td></tr>` : ""}
          ${email ? `<tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;">${email}</td></tr>` : ""}
          ${phone ? `<tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${phone}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;"><strong>Description:</strong><br/>${description}</p>
        <p style="margin-top:16px;color:#666;font-size:13px;">This submission needs review in the admin panel.</p>
      `,
    }).catch((err) => console.error("Email notification failed:", err));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
