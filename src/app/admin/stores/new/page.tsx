"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "refillery", "bulk-foods", "zero-waste", "thrift-consignment",
  "farmers-market", "manufacturer", "wholesale", "service-provider",
];

export default function NewStorePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    type: "brick-and-mortar",
    status: "active",
    website: "",
    email: "",
    phone: "",
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    address: "",
    city: "",
    state: "",
    country: "USA",
    postal_code: "",
    lat: "",
    lng: "",
    logo: "",
  });

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const id = `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${(form.city || "online").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    const { error: dbError } = await createClient().from("stores").insert({
      id,
      name: form.name,
      description: form.description || null,
      categories: form.categories,
      type: form.type,
      status: form.status,
      website: form.website || null,
      email: form.email || null,
      phone: form.phone || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      twitter: form.twitter || null,
      tiktok: form.tiktok || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country,
      postal_code: form.postal_code || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      logo: form.logo || null,
    });

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
    } else {
      router.push("/admin/stores");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Store</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  form.categories.includes(cat)
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Type & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="brick-and-mortar">Brick & Mortar</option>
              <option value="online">Online</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="active">Active</option>
              <option value="needs-review">Needs Review</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
          {form.logo && (
            <div className="mb-2">
              <img src={form.logo} alt="Logo preview" className="w-16 h-16 object-contain rounded border border-gray-200" />
            </div>
          )}
          <input
            type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError("");
              const tempName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "")}`;
              const { error: uploadErr } = await createClient().storage
                .from("logos")
                .upload(tempName, file, { contentType: file.type, upsert: true });
              if (uploadErr) {
                setError(`Logo upload failed: ${uploadErr.message}`);
                return;
              }
              const { data: { publicUrl } } = createClient().storage
                .from("logos")
                .getPublicUrl(tempName);
              setForm((prev) => ({ ...prev, logo: publicUrl }));
            }}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100"
          />
          <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPEG, or WebP (max 2MB)</p>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input type="text" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
            <input type="text" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
            <input type="text" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City{form.type !== "online" && " *"}</label>
            <input type="text" required={form.type !== "online"} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State{form.type !== "online" && " *"}</label>
            <input type="text" required={form.type !== "online"} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2">
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input type="text" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input type="text" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input type="text" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || !form.name || form.categories.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Store"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/stores")}
            className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
