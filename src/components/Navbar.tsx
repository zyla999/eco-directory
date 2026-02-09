"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/stores", label: "Browse Directory" },
  { href: "/map", label: "Map" },
  { href: "/submit", label: "List Your Business" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-xl text-green-700">
                Eco Directory
              </span>
            </Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-green-700 font-medium nav-link-animated"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setOpen(!open)}
              className="text-gray-600 p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-700 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
