import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Eco Directory",
  description:
    "Learn about Eco Directory, our mission to help people find sustainable and eco-friendly stores across North America.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        About Eco Directory
      </h1>

      <div className="prose prose-green max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Eco Directory exists to make sustainable shopping accessible to
            everyone. We believe that finding eco-friendly stores, refilleries,
            and zero-waste shops shouldn&apos;t be difficult. Our directory
            connects conscious consumers with sustainable businesses across
            North America.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What We Include
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Refilleries</strong> - Bring-your-own-container stores
                for household and personal care products
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Zero-Waste Stores</strong> - Package-free shopping for
                everyday essentials
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Bulk Food Stores</strong> - Sustainable grocery shopping
                with minimal packaging
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Sustainable Goods</strong> - Eco-friendly products and
                ethical brands
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Thrift & Consignment</strong> - Secondhand stores
                promoting circular fashion
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our directory is automatically updated using intelligent agents that
            search for new eco-friendly stores and verify existing listings. We
            also welcome store submissions from business owners who want to be
            included.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Every store in our directory is verified to ensure accuracy. We
            check that businesses are still operating and that their information
            is up-to-date.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Submit Your Store
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Own an eco-friendly store? We&apos;d love to include you in our
            directory. Submissions are reviewed to ensure quality and accuracy.
          </p>
          <Link
            href="/submit"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Submit Your Store
          </Link>
        </section>

        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Contact Us
          </h2>
          <p className="text-gray-600">
            Have questions, suggestions, or found an error? We&apos;d love to
            hear from you. Reach out to help make Eco Directory even better.
          </p>
        </section>
      </div>
    </div>
  );
}
