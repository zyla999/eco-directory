import { notFound } from "next/navigation";
import Link from "next/link";
import StoreCard from "@/components/StoreCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { getStoresByCategory, getCategories } from "@/lib/stores";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = getCategories();
  const cat = categories.find((c) => c.id === category);

  if (!cat) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${cat.name} Stores - Eco Directory`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categories = getCategories();
  const cat = categories.find((c) => c.id === category);

  if (!cat) {
    notFound();
  }

  const stores = getStoresByCategory(category);

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
              Stores
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{cat.name}</li>
        </ol>
      </nav>

      <AnimateOnScroll animation="fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{cat.name}</h1>
          <p className="text-gray-600">{cat.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stores.length} store{stores.length !== 1 ? "s" : ""} in this category
          </p>
        </div>
      </AnimateOnScroll>

      {stores.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, i) => (
            <AnimateOnScroll key={store.id} animation="fade-in-up" stagger={Math.min((i % 6) + 1, 7)} className="h-full">
              <StoreCard store={store} />
            </AnimateOnScroll>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No stores found in this category yet.</p>
          <Link
            href="/submit"
            className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
          >
            Submit a store
          </Link>
        </div>
      )}
    </div>
  );
}
