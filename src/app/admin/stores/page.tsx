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
  country: string;
  type: string;
  status: string;
  categories: string[];
  offers_wholesale: boolean;
  created_at: string;
}

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "active", label: "Active" },
  { key: "needs-review", label: "Needs Review" },
  { key: "closed", label: "Closed" },
];

const CATEGORIES = [
  "refillery", "bulk-foods", "zero-waste", "thrift-consignment",
  "farmers-market", "manufacturer", "wholesale", "service-provider",
];

type SortField = "name" | "city" | "state" | "created_at";
type SortDir = "asc" | "desc";

export default function AdminStoresPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, countryFilter, typeFilter, sortField, sortDir]);

  async function loadStores() {
    setLoading(true);
    let query = createClient()
      .from("stores")
      .select("id, name, city, state, country, type, status, categories, offers_wholesale, created_at")
      .order(sortField, { ascending: sortDir === "asc" });

    if (statusFilter) query = query.eq("status", statusFilter);
    if (categoryFilter) query = query.contains("categories", [categoryFilter]);
    if (countryFilter) query = query.eq("country", countryFilter);
    if (typeFilter) {
      if (typeFilter === "online") {
        query = query.in("type", ["online", "both"]);
      } else if (typeFilter === "mobile") {
        query = query.eq("type", "mobile");
      } else {
        query = query.in("type", ["brick-and-mortar", "both"]);
      }
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

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-gray-300 ml-1">&#8597;</span>;
    return <span className="text-green-600 ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
  }

  // Client-side search filter (instant, no DB round-trip)
  const filtered = search
    ? stores.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.city?.toLowerCase().includes(search.toLowerCase()) ||
          s.state?.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase())
      )
    : stores;

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
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
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

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search name, city, state, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              &#10005;
            </button>
          )}
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Country */}
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="text-sm rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">All Countries</option>
          <option value="USA">USA</option>
          <option value="Canada">Canada</option>
        </select>

        {/* Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="brick-and-mortar">Brick & Mortar</option>
          <option value="online">Online</option>
          <option value="mobile">Mobile</option>
        </select>

        {/* Clear filters */}
        {(search || categoryFilter || countryFilter || typeFilter) && (
          <button
            onClick={() => { setSearch(""); setCategoryFilter(""); setCountryFilter(""); setTypeFilter(""); }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} {filtered.length === 1 ? "store" : "stores"}
        {filtered.length !== stores.length && ` (of ${stores.length} loaded)`}
      </p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer select-none hover:text-green-700"
                    onClick={() => handleSort("name")}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer select-none hover:text-green-700"
                    onClick={() => handleSort("city")}
                  >
                    City <SortIcon field="city" />
                  </th>
                  <th
                    className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer select-none hover:text-green-700"
                    onClick={() => handleSort("state")}
                  >
                    State <SortIcon field="state" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Categories</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                  <th
                    className="text-left px-4 py-3 font-medium text-gray-700 cursor-pointer select-none hover:text-green-700"
                    onClick={() => handleSort("created_at")}
                  >
                    Added <SortIcon field="created_at" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/stores/${store.id}`} className="text-green-600 hover:text-green-700 font-medium">
                        {store.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{store.city || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{store.state || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        store.type === "online"
                          ? "bg-cyan-50 text-cyan-700"
                          : store.type === "both"
                          ? "bg-purple-50 text-purple-700"
                          : store.type === "mobile"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {store.type === "brick-and-mortar" ? "B&M" : store.type === "both" ? "Both" : store.type === "mobile" ? "Mobile" : "Online"}
                      </span>
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
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(store.created_at).toLocaleDateString()}
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No stores found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
