"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface StoreRow {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  categories: string[];
  created_at: string;
}

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "active", label: "Active" },
  { key: "needs-review", label: "Needs Review" },
  { key: "closed", label: "Closed" },
];

export default function AdminStoresPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function loadStores() {
    setLoading(true);
    let query = createClient()
      .from("stores")
      .select("id, name, city, state, status, categories, created_at")
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setStores(data || []);
    setLoading(false);
  }

  async function updateStatus(storeId: string, newStatus: string) {
    await createClient().from("stores").update({ status: newStatus }).eq("id", storeId);
    loadStores();
  }

  async function deleteStore(storeId: string) {
    if (!confirm("Are you sure you want to delete this store?")) return;
    await createClient().from("stores").delete().eq("id", storeId);
    loadStores();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <Link
          href="/admin/stores/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          + New Store
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              statusFilter === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Categories</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/stores/${store.id}`} className="text-green-600 hover:text-green-700 font-medium">
                      {store.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {store.city}{store.state ? `, ${store.state}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {store.categories.slice(0, 2).map((cat) => (
                        <span key={cat} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {cat}
                        </span>
                      ))}
                      {store.categories.length > 2 && (
                        <span className="text-xs text-gray-400">+{store.categories.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={store.status}
                      onChange={(e) => updateStatus(store.id, e.target.value)}
                      className={`text-xs font-medium rounded px-2 py-1 border-0 ${
                        store.status === "active"
                          ? "bg-green-100 text-green-800"
                          : store.status === "needs-review"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="needs-review">Needs Review</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteStore(store.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No stores found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
