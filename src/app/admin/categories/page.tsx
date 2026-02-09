"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", icon: "" });
  const [newForm, setNewForm] = useState({ id: "", name: "", description: "", icon: "" });
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data } = await createClient().from("categories").select("*").order("name");
    setCategories(data || []);
    setLoading(false);
  }

  function startEdit(cat: CategoryRow) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description, icon: cat.icon });
  }

  async function saveEdit(id: string) {
    await createClient().from("categories").update({
      name: editForm.name,
      description: editForm.description,
      icon: editForm.icon,
    }).eq("id", id);
    setEditingId(null);
    loadCategories();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    await createClient().from("categories").delete().eq("id", id);
    loadCategories();
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().from("categories").insert(newForm);
    if (!error) {
      setShowNew(false);
      setNewForm({ id: "", name: "", description: "", icon: "" });
      loadCategories();
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          {showNew ? "Cancel" : "+ New Category"}
        </button>
      </div>

      {showNew && (
        <form onSubmit={createCategory} className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="ID (e.g. zero-waste)"
              value={newForm.id}
              onChange={(e) => setNewForm({ ...newForm, id: e.target.value })}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="Display Name"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="Description"
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Icon"
                value={newForm.icon}
                onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
                className="rounded border border-gray-300 px-3 py-2 text-sm flex-1"
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                Add
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-700">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Icon</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-600">{cat.id}</td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="rounded border border-gray-300 px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="rounded border border-gray-300 px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    <span className="line-clamp-1">{cat.description}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <input
                      type="text"
                      value={editForm.icon}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      className="rounded border border-gray-300 px-2 py-1 text-sm w-20"
                    />
                  ) : (
                    cat.icon
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(cat.id)} className="text-xs text-green-600 hover:text-green-700">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-600 hover:text-gray-700">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(cat)} className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                      <button onClick={() => deleteCategory(cat.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
