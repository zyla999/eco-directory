import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eco Directory - Find Eco-Friendly Stores in North America",
  description:
    "Discover eco-friendly stores, refilleries, zero-waste shops, and sustainable businesses across the USA and Canada.",
  keywords: [
    "eco-friendly stores",
    "zero waste",
    "refillery",
    "sustainable shopping",
    "bulk foods",
    "green stores",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-2xl">🌿</span>
                  <span className="font-bold text-xl text-green-700">
                    Eco Directory
                  </span>
                </Link>
              </div>
              <div className="hidden sm:flex sm:items-center sm:gap-6">
                <Link
                  href="/stores"
                  className="text-gray-600 hover:text-green-700 font-medium"
                >
                  Browse Stores
                </Link>
                <Link
                  href="/map"
                  className="text-gray-600 hover:text-green-700 font-medium"
                >
                  Map
                </Link>
                <Link
                  href="/submit"
                  className="text-gray-600 hover:text-green-700 font-medium"
                >
                  Submit a Store
                </Link>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-green-700 font-medium"
                >
                  About
                </Link>
              </div>
              <div className="flex sm:hidden items-center">
                <button className="text-gray-600 p-2">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 text-sm">
              <p>
                © {new Date().getFullYear()} Eco Directory. Helping you find
                sustainable stores across North America.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
