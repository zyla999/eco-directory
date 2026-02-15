import { notFound } from "next/navigation";
import Link from "next/link";
import StoreCard from "@/components/StoreCard";
import SponsorCard from "@/components/SponsorCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import {
  getStatesWithStores,
  getStoresByStateSlug,
  getSponsorForState,
} from "@/lib/stores";
import { Metadata } from "next";

export const revalidate = 3600;

interface StatePageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const { state: slug } = await params;
  const states = await getStatesWithStores();
  const stateInfo = states.find((s) => s.slug === slug);

  if (!stateInfo) {
    return { title: "Location Not Found" };
  }

  return {
    title: `Eco-Friendly Businesses in ${stateInfo.stateName} - Eco Directory`,
    description: `Discover ${stateInfo.storeCount} eco-friendly businesses in ${stateInfo.stateName}. Browse sustainable stores, brands, and service providers.`,
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { state: slug } = await params;
  const states = await getStatesWithStores();
  const stateInfo = states.find((s) => s.slug === slug);

  if (!stateInfo) {
    notFound();
  }

  const stores = await getStoresByStateSlug(slug);
  const sponsor = await getSponsorForState(stateInfo.stateCode);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2" style={{ color: 'var(--eco-warm-gray)' }}>
          <li>
            <Link href="/" className="store-detail-link" style={{ color: 'var(--eco-warm-gray)' }}>
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/stores" className="store-detail-link" style={{ color: 'var(--eco-warm-gray)' }}>
              Directory
            </Link>
          </li>
          <li>/</li>
          <li style={{ color: 'var(--eco-charcoal)' }}>{stateInfo.stateName}</li>
        </ol>
      </nav>

      {/* Header Banner */}
      <AnimateOnScroll animation="fade-in-up">
        <div
          className="relative rounded-xl overflow-hidden mb-10"
          style={{ background: 'var(--eco-forest)' }}
        >
          <div className="eco-hero-grain" />
          <div className="relative z-[1] p-8 sm:p-10 md:p-12">
            <p className="eco-overline mb-3" style={{ color: 'rgba(248,245,240,0.5)' }}>
              Region
            </p>
            <h1
              className="eco-display"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--eco-cream)' }}
            >
              {stateInfo.stateName}
            </h1>
            <p className="mt-2" style={{ color: 'rgba(248,245,240,0.6)' }}>
              {stores.length} business{stores.length !== 1 ? "es" : ""} &middot; {stateInfo.country}
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Sponsor Banner */}
      {sponsor && (
        <div className="mb-8">
          <AnimateOnScroll animation="fade-in">
            <SponsorCard sponsor={sponsor} variant="banner" />
          </AnimateOnScroll>
        </div>
      )}

      {stores.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, i) => (
            <AnimateOnScroll
              key={store.id}
              animation="fade-in-up"
              stagger={Math.min((i % 8) + 1, 8)}
              className="h-full"
            >
              <StoreCard store={store} />
            </AnimateOnScroll>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 rounded-lg"
          style={{ background: 'var(--eco-mist)' }}
        >
          <p style={{ color: 'var(--eco-charcoal)' }}>
            No businesses found in {stateInfo.stateName} yet.
          </p>
          <Link
            href="/submit"
            className="font-medium mt-2 inline-block store-detail-link"
            style={{ color: 'var(--eco-sage)' }}
          >
            List your business
          </Link>
        </div>
      )}
    </div>
  );
}
