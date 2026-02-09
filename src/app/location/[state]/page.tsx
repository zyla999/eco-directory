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
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link href="/" className="hover:text-green-600">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/stores" className="hover:text-green-600">
              Directory
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{stateInfo.stateName}</li>
        </ol>
      </nav>

      <AnimateOnScroll animation="fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Eco-Friendly Businesses in {stateInfo.stateName}
          </h1>
          <p className="text-gray-600">
            {stores.length} business{stores.length !== 1 ? "es" : ""} listed in{" "}
            {stateInfo.stateName}, {stateInfo.country}
          </p>
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
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No businesses found in {stateInfo.stateName} yet.
          </p>
          <Link
            href="/submit"
            className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
          >
            List your business
          </Link>
        </div>
      )}
    </div>
  );
}
