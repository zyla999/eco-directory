import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import CategoryCard from "@/components/CategoryCard";
import SponsorCard from "@/components/SponsorCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { getAllStores, getCategories, getStoreStats, getSponsorsByPlacement, getStatesWithStores } from "@/lib/stores";

export const revalidate = 3600;

export default async function Home() {
  const stores = await getAllStores();
  const categories = await getCategories();
  const stats = await getStoreStats();
  const homepageSponsors = await getSponsorsByPlacement("homepage-featured");
  const statesWithStores = await getStatesWithStores();

  const featuredStores = stores.slice(0, 4);

  const canadaStates = statesWithStores.filter((s) => s.country === "Canada");
  const usaStates = statesWithStores.filter((s) => s.country === "USA");

  // Shuffle stores for hero mosaic — changes each revalidation (hourly)
  const shuffled = [...stores].sort(() => Math.random() - 0.5);
  const heroStores = shuffled.slice(0, 4);

  const categoryCounts = categories.map((cat) => ({
    category: cat,
    count: stores.filter((s) => s.categories.includes(cat.id)).length,
  }));

  const heroCardPositions: { style: React.CSSProperties; delay: string }[] = [
    { style: { top: '0%', left: '0%', transform: 'rotate(-3deg)', zIndex: 2 }, delay: '0.3s' },
    { style: { top: '5%', left: '45%', transform: 'rotate(2.5deg)', zIndex: 3 }, delay: '0.5s' },
    { style: { top: '48%', left: '5%', transform: 'rotate(2deg)', zIndex: 1 }, delay: '0.65s' },
    { style: { top: '42%', left: '40%', transform: 'rotate(-2.5deg)', zIndex: 4 }, delay: '0.8s' },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(201,203,163,0.92) 0%, rgba(180,183,140,0.95) 100%)' }}
        />
        <div className="eco-hero-grain absolute inset-0" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text + Search */}
            <div style={{ color: '#1B3A2D' }}>
              <p className="eco-overline mb-6 animate-hero-overline" style={{ opacity: 0.6 }}>
                Eco Directory
              </p>
              <h1 className="eco-display text-4xl sm:text-5xl lg:text-6xl mb-6 animate-hero-title">
                Discover eco-friendly businesses across North America
              </h1>
              <p className="text-lg md:text-xl max-w-xl mb-8 animate-hero-subtitle" style={{ opacity: 0.7 }}>
                Your curated directory of sustainable stores, refilleries, brands,
                wholesalers, and service providers.
              </p>
              <div className="max-w-lg animate-hero-search">
                <SearchBar large />
              </div>
            </div>

            {/* Right — Overlapping floating store cards */}
            <div className="hidden lg:block relative" style={{ minHeight: '480px' }}>
              {heroStores.map((store, i) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="animate-hero-card absolute block rounded-xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)]"
                  style={{
                    width: '54%',
                    background: 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(12px)',
                    animationDelay: heroCardPositions[i].delay,
                    ...heroCardPositions[i].style,
                  }}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <Image
                      src={store.logo || "/logos/default.svg"}
                      alt={store.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain rounded-lg flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-base truncate" style={{ color: '#2A2A28' }}>
                        {store.name}
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: '#7A756E' }}>
                        {store.location.city}, {store.location.state}
                      </div>
                    </div>
                  </div>
                  {store.description && (
                    <p className="text-sm line-clamp-2 mb-4" style={{ color: '#6B6560' }}>
                      {store.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {store.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(27,58,45,0.08)',
                          color: '#1B3A2D',
                        }}
                      >
                        {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#EDEAE4', borderBottom: '1px solid #DDD8D0' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: stats.totalStores, label: "Businesses" },
              { value: stats.totalCities, label: "Cities" },
              { value: stats.byCountry.USA, label: "USA" },
              { value: stats.byCountry.Canada, label: "Canada" },
            ].map((stat, i) => (
              <AnimateOnScroll key={stat.label} animation="fade-in-up" stagger={i + 1}>
                <div
                  className="text-center py-4"
                  style={{ borderLeft: i > 0 ? '1px solid #DDD8D0' : 'none' }}
                >
                  <div
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: '3.5rem',
                      lineHeight: 1,
                      color: '#1B3A2D',
                      fontOpticalSizing: 'auto' as const,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      color: '#7A756E',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-in">
            <div className="max-w-2xl mb-14">
              <p className="eco-overline mb-4" style={{ color: '#7A756E' }}>Browse</p>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '2.25rem',
                  color: '#2A2A28',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                Explore by Category
              </h2>
              <p className="mt-3 text-base" style={{ color: '#7A756E' }}>
                From refilleries to farmers markets — find what you&apos;re looking for.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {categoryCounts.map(({ category, count }, i) => (
              <AnimateOnScroll
                key={category.id}
                animation="fade-in-up"
                stagger={Math.min(i + 1, 8)}
                className="h-full"
              >
                <CategoryCard category={category} storeCount={count} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Region ── */}
      <section className="py-20 md:py-24" style={{ background: '#EDEAE4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-in">
            <div className="max-w-2xl mb-14">
              <p className="eco-overline mb-4" style={{ color: '#7A756E' }}>Locations</p>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '2.25rem',
                  color: '#2A2A28',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                Browse by Region
              </h2>
            </div>
          </AnimateOnScroll>

          {/* Canada */}
          {canadaStates.length > 0 && (
            <div className="mb-12">
              <AnimateOnScroll animation="fade-in">
                <p className="eco-overline mb-5" style={{ color: '#5B7F67' }}>Canada</p>
              </AnimateOnScroll>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {canadaStates.map((state, i) => (
                  <AnimateOnScroll
                    key={state.slug}
                    animation="fade-in-up"
                    stagger={Math.min(i + 1, 8)}
                  >
                    <Link
                      href={`/location/${state.slug}`}
                      className="block rounded-lg p-4 card-hover-lift text-center"
                      style={{ background: '#F8F5F0', border: '1px solid #DDD8D0' }}
                    >
                      <div className="font-medium text-sm" style={{ color: '#2A2A28' }}>
                        {state.stateName}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#7A756E' }}>
                        {state.storeCount} {state.storeCount === 1 ? 'business' : 'businesses'}
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          )}

          {/* United States */}
          {usaStates.length > 0 && (
            <div>
              <AnimateOnScroll animation="fade-in">
                <p className="eco-overline mb-5" style={{ color: '#5B7F67' }}>United States</p>
              </AnimateOnScroll>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {usaStates.map((state, i) => (
                  <AnimateOnScroll
                    key={state.slug}
                    animation="fade-in-up"
                    stagger={Math.min(i + 1, 8)}
                  >
                    <Link
                      href={`/location/${state.slug}`}
                      className="block rounded-lg p-4 card-hover-lift text-center"
                      style={{ background: '#F8F5F0', border: '1px solid #DDD8D0' }}
                    >
                      <div className="font-medium text-sm" style={{ color: '#2A2A28' }}>
                        {state.stateName}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#7A756E' }}>
                        {state.storeCount} {state.storeCount === 1 ? 'business' : 'businesses'}
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Sponsor Banner ── */}
      {homepageSponsors.length > 0 && (
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll animation="fade-in">
              <SponsorCard sponsor={homepageSponsors[0]} variant="banner" />
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* ── Featured Businesses ── */}
      <section className="py-20 md:py-24" style={{ background: '#EDEAE4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="fade-in">
            <div className="flex items-end justify-between mb-14">
              <div className="max-w-2xl">
                <p className="eco-overline mb-4" style={{ color: '#7A756E' }}>Featured</p>
                <h2
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '2.25rem',
                    color: '#2A2A28',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.15,
                  }}
                >
                  Worth Discovering
                </h2>
              </div>
              <Link
                href="/stores"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200 pb-1"
                style={{ color: '#5B7F67', borderBottom: '1px solid transparent' }}
                onMouseEnter={undefined}
              >
                View all businesses
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStores.map((store, i) => (
              <AnimateOnScroll
                key={store.id}
                animation="fade-in-up"
                stagger={i + 1}
                className="h-full"
              >
                <StoreCard store={store} />
              </AnimateOnScroll>
            ))}
          </div>
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/stores"
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: '#5B7F67' }}
            >
              View all businesses <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden" style={{ background: '#1B3A2D' }}>
        <Image
          src="https://images.unsplash.com/photo-1542273917363-1f3c5c9a1c73?w=1920&q=60"
          alt=""
          fill
          className="object-cover"
          style={{ opacity: 0.15 }}
        />
        <div className="eco-hero-grain absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl mx-auto text-center" style={{ color: '#F8F5F0' }}>
            <AnimateOnScroll animation="fade-in-up">
              <p className="eco-overline mb-6" style={{ opacity: 0.4 }}>Community</p>
              <h2
                className="mb-5"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}
              >
                Know a business that belongs here?
              </h2>
              <p className="text-lg max-w-lg mx-auto mb-10" style={{ opacity: 0.55 }}>
                Help us grow this directory. Submit an eco-friendly business
                and connect them with a community that cares.
              </p>
              <Link
                href="/submit"
                className="inline-block rounded-lg font-medium px-10 py-4 text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: '#F8F5F0', color: '#1B3A2D' }}
              >
                Submit a Business
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
