"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface DashboardStats {
  totalStores: number;
  activeStores: number;
  pendingReviews: number;
  closedStores: number;
  totalCategories: number;
  totalSponsors: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();
      const [
        { count: totalStores },
        { count: activeStores },
        { count: pendingReviews },
        { count: closedStores },
        { count: totalCategories },
        { count: totalSponsors },
      ] = await Promise.all([
        supabase.from("stores").select("*", { count: "exact", head: true }),
        supabase.from("stores").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("stores").select("*", { count: "exact", head: true }).eq("status", "needs-review"),
        supabase.from("stores").select("*", { count: "exact", head: true }).eq("status", "closed"),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("sponsors").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalStores: totalStores ?? 0,
        activeStores: activeStores ?? 0,
        pendingReviews: pendingReviews ?? 0,
        closedStores: closedStores ?? 0,
        totalCategories: totalCategories ?? 0,
        totalSponsors: totalSponsors ?? 0,
      });
    }
    loadStats();
  }, []);

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const cards = [
    { label: "Total Stores", value: stats.totalStores, href: "/admin/stores", color: "bg-blue-50 text-blue-700" },
    { label: "Active", value: stats.activeStores, href: "/admin/stores?status=active", color: "bg-green-50 text-green-700" },
    { label: "Pending Review", value: stats.pendingReviews, href: "/admin/stores?status=needs-review", color: "bg-amber-50 text-amber-700" },
    { label: "Closed", value: stats.closedStores, href: "/admin/stores?status=closed", color: "bg-gray-100 text-gray-700" },
    { label: "Categories", value: stats.totalCategories, href: "/admin/categories", color: "bg-purple-50 text-purple-700" },
    { label: "Sponsors", value: stats.totalSponsors, href: "/admin/sponsors", color: "bg-teal-50 text-teal-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-lg p-6 ${card.color} hover:shadow-md transition`}
          >
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm mt-1 opacity-80">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
