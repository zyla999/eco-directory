import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getStoreById } from "@/lib/stores";
import { categoryColors } from "@/lib/categoryConfig";
import { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const revalidate = 3600;

function socialUrl(value: string, base: string): string {
  if (value.startsWith("http")) return value;
  return `${base}/${value.replace("@", "")}`;
}

interface StorePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreById(id);

  if (!store) {
    return { title: "Store Not Found" };
  }

  return {
    title: `${store.name} - Eco Directory`,
    description: store.description,
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { id } = await params;
  const store = await getStoreById(id);

  if (!store) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Stores
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{store.name}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <AnimateOnScroll animation="fade-in-up">
            <div className="flex items-start gap-6 mb-6">
              <Image
                src={store.logo || "/logos/default.svg"}
                alt={`${store.name} logo`}
                width={80}
                height={80}
                className="w-20 h-20 object-contain rounded-lg border border-gray-200"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-gray-500 mt-1">
                  {store.location.city}, {store.location.state},{" "}
                  {store.location.country}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {store.categories.map((category) => (
                    <Link
                      key={category}
                      href={`/category/${category}`}
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        categoryColors[category] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Link>
                  ))}
                  {store.offersWholesale && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Wholesale Available
                    </span>
                  )}
                  {store.offersLocalDelivery && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-teal-100 text-teal-800">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      Local Delivery
                    </span>
                  )}
                  <span className="text-gray-300">|</span>
                  {store.type.includes("brick-and-mortar") && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                      Brick & Mortar
                    </span>
                  )}
                  {store.type.includes("online") && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-cyan-50 text-cyan-700">
                      Online Store
                    </span>
                  )}
                  {store.type.includes("mobile") && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-orange-50 text-orange-700">
                      Mobile Delivery
                    </span>
                  )}
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Description */}
          {store.description && (
            <AnimateOnScroll animation="fade-in">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600 leading-relaxed">{store.description}</p>
              </div>
            </AnimateOnScroll>
          )}

          {/* Details Grid */}
          <AnimateOnScroll animation="slide-in-left">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Location */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {store.additionalLocations && store.additionalLocations.length > 0
                    ? "Locations"
                    : "Location"}
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1 text-gray-600">
                    {store.additionalLocations && store.additionalLocations.length > 0 && (
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Primary</p>
                    )}
                    {store.location.address && <p>{store.location.address}</p>}
                    <p>
                      {store.location.city}, {store.location.state}{" "}
                      {store.location.postalCode}
                    </p>
                    <p>{store.location.country}</p>
                  </div>
                  {store.additionalLocations?.map((loc, i) => (
                    <div key={loc.id || i} className="space-y-1 text-gray-600 border-t border-gray-100 pt-3">
                      {loc.label && (
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{loc.label}</p>
                      )}
                      {loc.address && <p>{loc.address}</p>}
                      <p>
                        {loc.city}, {loc.state} {loc.postalCode}
                      </p>
                      <p>{loc.country}</p>
                      {loc.phone && (
                        <a href={`tel:${loc.phone}`} className="text-green-600 hover:text-green-700 text-sm">
                          {loc.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Contact
                </h2>
                <div className="space-y-2">
                  {store.website && (
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:text-green-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Visit Website
                    </a>
                  )}
                  {store.email && (
                    <a
                      href={`mailto:${store.email}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-green-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {store.email}
                    </a>
                  )}
                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-green-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {store.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Social Links */}
          {(store.instagram || store.facebook || store.twitter || store.tiktok || store.pinterest) && (
            <AnimateOnScroll animation="slide-in-right">
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Follow
                </h2>
                <div className="flex gap-4">
                  {store.instagram && (
                    <a
                      href={socialUrl(store.instagram, "https://instagram.com")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-600"
                    >
                      <span className="sr-only">Instagram</span>
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                    </a>
                  )}
                  {store.facebook && (
                    <a
                      href={socialUrl(store.facebook, "https://facebook.com")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <span className="sr-only">Facebook</span>
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                  )}
                  {store.twitter && (
                    <a
                      href={socialUrl(store.twitter, "https://twitter.com")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-sky-500"
                    >
                      <span className="sr-only">Twitter</span>
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  )}
                  {store.tiktok && (
                    <a
                      href={socialUrl(store.tiktok, "https://tiktok.com")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-900"
                    >
                      <span className="sr-only">TikTok</span>
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V12a4.85 4.85 0 01-5.58-2.17V2h3.45a4.83 4.83 0 002.13 4.69z" />
                      </svg>
                    </a>
                  )}
                  {store.pinterest && (
                    <a
                      href={socialUrl(store.pinterest, "https://pinterest.com")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-red-600"
                    >
                      <span className="sr-only">Pinterest</span>
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </AnimateOnScroll>
          )}

          {/* Last Verified */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            Last verified: {new Date(store.lastVerifiedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href="/stores"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to all stores
        </Link>
      </div>
    </div>
  );
}
