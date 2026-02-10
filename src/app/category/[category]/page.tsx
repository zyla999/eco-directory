import { notFound } from "next/navigation";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import CategoryStoreList from "@/components/CategoryStoreList";
import { getStoresByCategory, getCategories, getMainSponsors, getSponsorsForCategoryPage } from "@/lib/stores";
import { Metadata } from "next";

export const revalidate = 3600;

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

  return {
    title: `${cat.name} Businesses - Eco Directory`,
    description: cat.description,
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
          <li className="text-gray-900">{cat.name}</li>
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
