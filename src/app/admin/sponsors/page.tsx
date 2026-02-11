"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SponsorRow {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  cta: string;
  image: string;
  video: string;
  placement: string[];
  target_categories: string[];
  target_states: string[];
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const EMPTY_SPONSOR = {
  id: "",
  name: "",
  description: "",
  logo: "",
  website: "",
  cta: "",
  image: "",
  video: "",
  placement: [] as string[],
  target_categories: [] as string[],
  target_states: [] as string[],
  start_date: "",
  end_date: "",
  is_active: true,
};

const PLACEMENT_OPTIONS = ["homepage-featured", "category-sidebar", "state-banner", "main-sponsor"];

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_SPONSOR });
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    loadSponsors();
  }, []);

  async function loadSponsors() {
    setLoading(true);
    const { data } = await createClient().from("sponsors").select("*").order("name");
    setSponsors(data || []);
    setLoading(false);
  }

  function startEdit(s: SponsorRow) {
    setEditingId(s.id);
    setForm({
      id: s.id,
      name: s.name,
      description: s.description || "",
      logo: s.logo || "",
      website: s.website || "",
      cta: s.cta || "",
      image: s.image || "",
      video: s.video || "",
      placement: s.placement || [],
      target_categories: s.target_categories || [],
      target_states: s.target_states || [],
      start_date: s.start_date || "",
      end_date: s.end_date || "",
      is_active: s.is_active,
    });
    setShowNew(false);
  }

  function startNew() {
    setEditingId(null);
    setForm({ ...EMPTY_SPONSOR });
    setShowNew(true);
  }

  function togglePlacement(p: string) {
    setForm((prev) => ({
      ...prev,
      placement: prev.placement.includes(p)
        ? prev.placement.filter((x) => x !== p)
        : [...prev.placement, p],
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const row = {
      id: form.id,
      name: form.name,
      description: form.description,
      logo: form.logo || null,
      website: form.website || null,
      cta: form.cta || null,
      image: form.image || null,
      video: form.video || null,
      placement: form.placement,
      target_categories: form.target_categories,
      target_states: form.target_states,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_active: form.is_active,
    };

    if (editingId) {
      await createClient().from("sponsors").update(row).eq("id", editingId);
    } else {
      await createClient().from("sponsors").insert(row);
    }

    setEditingId(null);
    setShowNew(false);
    loadSponsors();
  }

  async function deleteSponsor(id: string) {
    if (!confirm("Delete this sponsor?")) return;
    await createClient().from("sponsors").delete().eq("id", id);
    loadSponsors();
  }

  async function toggleActive(id: string, current: boolean) {
    await createClient().from("sponsors").update({ is_active: !current }).eq("id", id);
    loadSponsors();
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const isEditing = editingId || showNew;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sponsors</h1>
        <button
          onClick={startNew}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          + New Sponsor
        </button>
      </div>

      {isEditing && (
        <form onSubmit={save} className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? "Edit Sponsor" : "New Sponsor"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID *</label>
              <input
                type="text"
                required
                disabled={!!editingId}
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo Path</label>
              <input type="text" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
              <input type="text" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Ad Media */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Image URL</label>
              <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/ad-banner.jpg" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Banner image displayed as the ad (16:9 ratio works best)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Video URL</label>
              <input type="url" value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} placeholder="https://example.com/ad-video.mp4" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Video autoplays muted (takes priority over image)</p>
            </div>
          </div>

          {/* Placement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Placement</label>
            <div className="flex gap-2">
              {PLACEMENT_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlacement(p)}
                  className={`px-3 py-1 rounded-full text-xs transition ${
                    form.placement.includes(p) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Targeting */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Categories (comma-separated)</label>
              <input
                type="text"
                value={form.target_categories.join(", ")}
                onChange={(e) => setForm({ ...form, target_categories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target States (comma-separated)</label>
              <input
                type="text"
                value={form.target_states.join(", ")}
                onChange={(e) => setForm({ ...form, target_states: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Dates & Active */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-green-600" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
              {editingId ? "Save" : "Create"}
            </button>
            <button type="button" onClick={() => { setEditingId(null); setShowNew(false); }} className="text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Placement</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Dates</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Active</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sponsors.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.placement.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{p}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {s.start_date} — {s.end_date}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(s.id, s.is_active)}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      s.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.is_active ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(s)} className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                    <button onClick={() => deleteSponsor(s.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {sponsors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No sponsors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
