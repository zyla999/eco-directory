import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import CategoryCard from "@/components/CategoryCard";
import { getAllStores, getCategories, getStoreStats } from "@/lib/stores";

export default function Home() {
  const stores = getAllStores();
  const categories = getCategories();
  const stats = getStoreStats();

  const featuredStores = stores.slice(0, 4);

  const categoryCounts = categories.map((cat) => ({
    category: cat,
    count: stores.filter((s) => s.categories.includes(cat.id)).length,
  }));

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Find Eco-Friendly Stores Near You
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Discover refilleries, zero-waste shops, and sustainable businesses
              across North America. Shop consciously, live sustainably.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar large />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-700">
                {stats.totalStores}
              </div>
              <div className="text-gray-500">Stores Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-700">
                {stats.totalCities}
              </div>
              <div className="text-gray-500">Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-700">
                {stats.byCountry.USA}
              </div>
              <div className="text-gray-500">USA Stores</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-700">
                {stats.byCountry.Canada}
              </div>
              <div className="text-gray-500">Canada Stores</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categoryCounts.map(({ category, count }) => (
              <CategoryCard
                key={category.id}
                category={category}
                storeCount={count}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Stores
            </h2>
            <Link
              href="/stores"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View all stores →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Own an Eco-Friendly Store?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Get your store listed in our directory and help more people
              discover sustainable shopping options in their area.
            </p>
            <Link
              href="/submit"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Submit Your Store
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
