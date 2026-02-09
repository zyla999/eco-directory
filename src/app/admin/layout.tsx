"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.length === 0) return true; // no allowlist = allow all authenticated
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user && pathname !== "/admin/login") {
        router.replace("/admin/login");
      } else if (user && !isAdminEmail(user.email)) {
        setUnauthorized(true);
      } else {
        setAuthenticated(!!user);
      }
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login");
      } else if (session?.user && !isAdminEmail(session.user.email)) {
        setUnauthorized(true);
      } else if (session) {
        setAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Login page renders without the admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">Your email is not authorized to access the admin dashboard.</p>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.replace("/admin/login");
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/stores", label: "Stores" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/sponsors", label: "Sponsors" },
    { href: "/admin/import", label: "CSV Import" },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="text-xl font-bold text-green-700">
            Eco Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition"
          >
            Sign Out
          </button>
          <Link
            href="/"
            className="block px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition mt-1"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
