"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdditionalLocation {
  label: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  lat: string;
  lng: string;
  phone: string;
}

function emptyLocation(): AdditionalLocation {
  return { label: "", address: "", city: "", state: "", country: "USA", postal_code: "", lat: "", lng: "", phone: "" };
}

const CATEGORIES = [
  "refillery", "bulk-foods", "zero-waste", "thrift-consignment",
  "farmers-market", "manufacturer", "wholesale", "service-provider", "apothecary",
];

const STORE_TYPES = [
  { value: "brick-and-mortar", label: "Brick & Mortar" },
  { value: "online", label: "Online" },
  { value: "mobile", label: "Mobile" },
];

function selectionToType(sel: string[]): string {
  if (sel.length === 0) return "brick-and-mortar";
  if (sel.length === 1) return sel[0];
  return [...sel].sort().join("+");
}

export default function NewStorePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    categories: [] as string[],
    types: ["brick-and-mortar"] as string[],
    status: "active",
    website: "",
    email: "",
    phone: "",
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    pinterest: "",
    address: "",
    city: "",
    state: "",
    country: "USA",
    postal_code: "",
    lat: "",
    lng: "",
    logo: "",
    offers_wholesale: false,
    offers_local_delivery: false,
  });
  const [additionalLocations, setAdditionalLocations] = useState<AdditionalLocation[]>([]);

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

    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let id = `${slug(form.name)}-${slug(form.city || "online")}`;
    if (form.address) {
      const num = form.address.match(/^\d+/);
      if (num) id = `${id}-${num[0]}`;
    }

    const { error: dbError } = await createClient().from("stores").insert({
      id,
      name: form.name,
      description: form.description || null,
      categories: form.categories,
      type: selectionToType(form.types),
      status: form.status,
      website: form.website || null,
      email: form.email || null,
      phone: form.phone || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      twitter: form.twitter || null,
      tiktok: form.tiktok || null,
      pinterest: form.pinterest || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country,
      postal_code: form.postal_code || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      logo: form.logo || null,
      offers_wholesale: form.offers_wholesale,
      offers_local_delivery: form.offers_local_delivery,
    });

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    // Insert additional locations
    const toInsert = additionalLocations
      .filter((loc) => loc.city && loc.state)
      .map((loc) => ({
        store_id: id,
        label: loc.label || null,
        address: loc.address || null,
        city: loc.city,
        state: loc.state,
        country: loc.country || "USA",
        postal_code: loc.postal_code || null,
        lat: loc.lat ? parseFloat(loc.lat) : null,
        lng: loc.lng ? parseFloat(loc.lng) : null,
        phone: loc.phone || null,
      }));

    if (toInsert.length > 0) {
      const { error: locError } = await createClient().from("store_locations").insert(toInsert);
      if (locError) {
        setError(`Store created but locations failed: ${locError.message}`);
        setSaving(false);
        return;
      }
    }

    router.push("/admin/stores");
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

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
          <div className="flex flex-wrap gap-2">
            {STORE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    types: prev.types.includes(t.value)
                      ? prev.types.filter((v) => v !== t.value)
                      : [...prev.types, t.value],
                  }))
                }
                className={`px-3 py-1 rounded-full text-sm transition ${
                  form.types.includes(t.value)
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status & Flags */}
        <div className="grid grid-cols-3 gap-4">
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
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.offers_wholesale}
                onChange={(e) => setForm({ ...form, offers_wholesale: e.target.checked })}
                className="rounded border-gray-300 text-amber-600"
              />
              <span className="text-sm text-gray-700">Offers Wholesale</span>
            </label>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.offers_local_delivery}
                onChange={(e) => setForm({ ...form, offers_local_delivery: e.target.checked })}
                className="rounded border-gray-300 text-teal-600"
              />
              <span className="text-sm text-gray-700">Local Delivery</span>
            </label>
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
          {form.logo && (
            <div className="mb-2 flex items-center gap-3">
              <img src={form.logo} alt="Logo preview" className="w-16 h-16 object-contain rounded border border-gray-200" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, logo: "" }))}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove logo
              </button>
            </div>
          )}
          <input
            key={form.logo}
            type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError("");
              const tempName = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "")}`;
              const supabase = createClient();
              const { error: uploadErr } = await supabase.storage
                .from("logos")
                .upload(tempName, file, { contentType: file.type, upsert: true });
              if (uploadErr) {
                setError(`Logo upload failed: ${uploadErr.message}`);
                return;
              }
              const { data: { publicUrl } } = supabase.storage
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
            <input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="URL or @handle" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input type="text" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="Full URL or page name" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
            <input type="text" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="URL or @handle" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
            <input type="text" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} placeholder="URL or @handle" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pinterest</label>
            <input type="text" value={form.pinterest} onChange={(e) => setForm({ ...form, pinterest: e.target.value })} placeholder="URL or @handle" className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City{form.types.includes("brick-and-mortar") && " *"}</label>
            <input type="text" required={form.types.includes("brick-and-mortar")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State{form.types.includes("brick-and-mortar") && " *"}</label>
            <input type="text" required={form.types.includes("brick-and-mortar")} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" />
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

        {/* Additional Locations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Additional Locations</label>
            <button
              type="button"
              onClick={() => setAdditionalLocations([...additionalLocations, emptyLocation()])}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              + Add Location
            </button>
          </div>
          {additionalLocations.map((loc, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 mb-3 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Location {i + 1}</span>
                <button
                  type="button"
                  onClick={() => setAdditionalLocations(additionalLocations.filter((_, j) => j !== i))}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input type="text" value={loc.label} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], label: e.target.value }; setAdditionalLocations(a); }} placeholder="e.g. Downtown Branch" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input type="tel" value={loc.phone} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], phone: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address</label>
                <input type="text" value={loc.address} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], address: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City *</label>
                  <input type="text" value={loc.city} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], city: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">State *</label>
                  <input type="text" value={loc.state} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], state: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Country</label>
                  <select value={loc.country} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], country: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                  <input type="text" value={loc.postal_code} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], postal_code: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input type="text" value={loc.lat} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], lat: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input type="text" value={loc.lng} onChange={(e) => { const a = [...additionalLocations]; a[i] = { ...a[i], lng: e.target.value }; setAdditionalLocations(a); }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || !form.name || form.categories.length === 0 || form.types.length === 0}
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
