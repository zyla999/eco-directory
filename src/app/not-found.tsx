import Link from "next/link";
import SearchBar from "@/components/SearchBar";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div
          className="eco-display mb-4"
          style={{
            fontSize: "clamp(5rem, 12vw, 8rem)",
            color: "var(--eco-forest)",
            lineHeight: 1,
          }}
        >
          404
        </div>
        <h1
          className="text-xl mb-2"
          style={{ color: "var(--eco-charcoal)", fontWeight: 600 }}
        >
          Page not found
        </h1>
        <p className="mb-8" style={{ color: "var(--eco-warm-gray)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try searching for what you need.
        </p>
        <div className="mb-8">
          <SearchBar />
        </div>
        <Link
          href="/"
          className="inline-block text-sm font-medium store-detail-link"
          style={{ color: "var(--eco-sage)" }}
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
