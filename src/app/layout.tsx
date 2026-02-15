import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://eco-directory.com"),
  title: "Eco Directory - Eco-Friendly Business Directory for North America",
  description:
    "Discover eco-friendly stores, brands, wholesalers, and service providers across the USA and Canada. Your directory for sustainable businesses.",
  keywords: [
    "eco-friendly stores",
    "sustainable brands",
    "eco wholesale",
    "refillery",
    "sustainable shopping",
    "green business directory",
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
        <ScrollToTop />
        <Navbar />
        <main>{children}</main>
        <footer className="bg-gradient-to-b from-gray-50 to-green-50 border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 text-sm">
              <p>
                © {new Date().getFullYear()} Eco Directory. Your directory for
                sustainable businesses across North America.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
