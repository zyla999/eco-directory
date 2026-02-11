import { notFound } from "next/navigation";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import CategoryStoreList from "@/components/CategoryStoreList";
import { getStoresByCategory, getCategories, getMainSponsors, getSponsorsForCategoryPage } from "@/lib/stores";
import { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecodirectory.ca";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.id === category);

  if (!cat) {
    return { title: "Category Not Found" };
  }

  const stores = await getStoresByCategory(category);
  const countries = [...new Set(stores.map((s) => s.location.country))];
  const regionText = countries.length > 0 ? countries.join(" and ") : "North America";

  const title = `${cat.name} Eco-Friendly Businesses - Eco Directory`;
  const description = `Browse ${stores.length} ${cat.name.toLowerCase()} business${stores.length !== 1 ? "es" : ""} in ${regionText}. ${cat.description}`;
  const url = `${SITE_URL}/category/${category}`;

  return {
    title,
    description,
    keywords: [
      `${cat.name.toLowerCase()} stores`,
      `eco-friendly ${cat.name.toLowerCase()}`,
      `sustainable ${cat.name.toLowerCase()}`,
      `${cat.name.toLowerCase()} near me`,
      "eco directory",
      "green businesses",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Eco Directory",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.id === category);

  if (!cat) {
    notFound();
  }

  const [stores, mainSponsors] = await Promise.all([
    getStoresByCategory(category),
    getMainSponsors(),
  ]);

  // Fetch category sponsors excluding main sponsor IDs so all are different entities
  const mainIds = mainSponsors.map((s) => s.id);
  const categorySponsors = await getSponsorsForCategoryPage(category, mainIds);

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Directory",
        item: `${SITE_URL}/stores`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cat.name,
        item: `${SITE_URL}/category/${category}`,
      },
    ],
  };

  // JSON-LD: ItemList of local businesses
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.name} Businesses`,
    description: cat.description,
    numberOfItems: stores.length,
    itemListElement: stores.slice(0, 50).map((store, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: store.name,
        description: store.description,
        url: `${SITE_URL}/stores/${store.id}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: store.location.city,
          addressRegion: store.location.state,
          addressCountry: store.location.country,
        },
        ...(store.website ? { sameAs: store.website } : {}),
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/" className="hover:text-green-600" itemProp="item">
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <li aria-hidden="true">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link href="/stores" className="hover:text-green-600" itemProp="item">
              <span itemProp="name">Directory</span>
            </Link>
            <meta itemProp="position" content="2" />
          </li>
          <li aria-hidden="true">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span className="text-gray-900" itemProp="name">{cat.name}</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      <AnimateOnScroll animation="fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{cat.name}</h1>
          <p className="text-gray-600">{cat.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stores.length} business{stores.length !== 1 ? "es" : ""} in this category
          </p>
        </div>
      </AnimateOnScroll>

      <CategoryStoreList
        stores={stores}
        categoryName={cat.name}
        mainSponsors={mainSponsors}
        categorySponsors={categorySponsors}
      />
    </div>
  );
}
