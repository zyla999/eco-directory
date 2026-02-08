import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import CategoryCard from "@/components/CategoryCard";
import SponsorCard from "@/components/SponsorCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { getAllStores, getCategories, getStoreStats, getSponsorsByPlacement } from "@/lib/stores";

export default function Home() {
  const stores = getAllStores();
  const categories = getCategories();
  const stats = getStoreStats();
  const homepageSponsors = getSponsorsByPlacement("homepage-featured");

  const featuredStores = stores.slice(0, 4);

  const categoryCounts = categories.map((cat) => ({
    category: cat,
    count: stores.filter((s) => s.categories.includes(cat.id)).length,
  }));

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white">
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-800/85 to-green-950/90 hero-gradient-animated" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-hero-title">
              Discover Eco-Friendly Businesses Across North America
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto animate-hero-subtitle">
              Your directory for sustainable stores, brands, wholesalers, and
              service providers. Shop consciously or grow your green business.
            </p>
            <div className="max-w-2xl mx-auto animate-hero-search">
              <SearchBar large />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats.totalStores, label: "Businesses Listed" },
              { value: stats.totalCities, label: "Cities" },
              { value: stats.byCountry.USA, label: "USA Businesses" },
              { value: stats.byCountry.Canada, label: "Canada Businesses" },
            ].map((stat, i) => (
              <AnimateOnScroll key={stat.label} animation="fade-in-up" stagger={i + 1}>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="text-3xl font-bold text-green-700">
                    {stat.value}
                  </div>
                  <div className="text-gray-500">{stat.label}</div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="slide-in-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Browse by Category
            </h2>
          </AnimateOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {categoryCounts.map(({ category, count }, i) => (
              <AnimateOnScroll key={category.id} animation="fade-in-up" stagger={Math.min(i + 1, 8)} className="h-full">
                <CategoryCard
                  category={category}
                  storeCount={count}
                />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Banner */}
      {homepageSponsors.length > 0 && (
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="fade-in">
              <SponsorCard sponsor={homepageSponsors[0]} variant="banner" />
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* Featured Businesses Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Businesses
              </h2>
              <Link
                href="/stores"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View all businesses →
              </Link>
            </div>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStores.map((store, i) => (
              <AnimateOnScroll key={store.id} animation="fade-in-up" stagger={i + 1} className="h-full">
                <StoreCard store={store} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="scale-in">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80"
                alt=""
                fill
                className="object-cover"
              />
              <div className="relative bg-green-900/60 backdrop-blur-sm p-8 md:p-12 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Run an Eco-Friendly Business?
                </h2>
                <p className="text-green-100 mb-6 max-w-xl mx-auto">
                  Get your business listed in our directory and help more people
                  discover sustainable shopping options in their area.
                </p>
                <Link
                  href="/submit"
                  className="inline-block bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-50 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  List Your Business
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
