"use client";

import { useState } from "react";
import { StoreCategory } from "@/types/store";

const categories: { id: StoreCategory; name: string }[] = [
  { id: "refillery", name: "Refillery" },
  { id: "bulk-foods", name: "Bulk Foods" },
  { id: "zero-waste", name: "Zero Waste" },
  { id: "thrift-consignment", name: "Thrift & Consignment" },
  { id: "farmers-market", name: "Farmers Market" },
  { id: "manufacturer", name: "Manufacturer / Brand" },
  { id: "wholesale", name: "Wholesale Distributor" },
  { id: "service-provider", name: "Service Provider" },
  { id: "apothecary", name: "Apothecary" },
];

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categories: [] as StoreCategory[],
    types: ["brick-and-mortar"] as string[],
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "USA",
    postalCode: "",
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    pinterest: "",
    youtube: "",
    linkedin: "",
    offersWholesale: false,
    offersLocalDelivery: false,
  });

  const handleCategoryChange = (categoryId: StoreCategory) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const type = formData.types.length > 0
        ? [...formData.types].sort().join("+")
        : "brick-and-mortar";

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-green-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You for Your Submission!
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve received your business submission and will review it
            shortly. Once approved, your business will appear in our directory.
          </p>
          <a
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Submit Your Business
      </h1>
      <p className="text-gray-600 mb-8">
        Add your eco-friendly business to our directory. All submissions are
        reviewed before being published.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tell us about your business, what makes it eco-friendly, and what products or services you offer..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Type *
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: "brick-and-mortar", label: "Physical Store" },
                  { value: "online", label: "Online" },
                  { value: "mobile", label: "Mobile" },
                ].map((t) => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.types.includes(t.value)}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          types: prev.types.includes(t.value)
                            ? prev.types.filter((v) => v !== t.value)
                            : [...prev.types, t.value],
                        }))
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Wholesale & Delivery */}
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.offersWholesale}
                  onChange={(e) =>
                    setFormData({ ...formData, offersWholesale: e.target.checked })
                  }
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-700">Offers Wholesale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.offersLocalDelivery}
                  onChange={(e) =>
                    setFormData({ ...formData, offersLocalDelivery: e.target.checked })
                  }
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Offers Local Delivery</span>
              </label>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://yourstore.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        {!(formData.types.length === 1 && formData.types[0] === "online") && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    required={formData.types.includes("brick-and-mortar") || formData.types.includes("mobile")}
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State/Province *
                  </label>
                  <input
                    type="text"
                    id="state"
                    required={formData.types.includes("brick-and-mortar") || formData.types.includes("mobile")}
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="e.g., CA, NY, ON"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country *
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Social Media */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Social Media
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="instagram"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Instagram
              </label>
              <input
                type="text"
                id="instagram"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
                placeholder="@yourstore or URL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="facebook"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Facebook
              </label>
              <input
                type="text"
                id="facebook"
                value={formData.facebook}
                onChange={(e) =>
                  setFormData({ ...formData, facebook: e.target.value })
                }
                placeholder="Page name or URL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="twitter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Twitter / X
              </label>
              <input
                type="text"
                id="twitter"
                value={formData.twitter}
                onChange={(e) =>
                  setFormData({ ...formData, twitter: e.target.value })
                }
                placeholder="@yourstore or URL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="tiktok"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                TikTok
              </label>
              <input
                type="text"
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) =>
                  setFormData({ ...formData, tiktok: e.target.value })
                }
                placeholder="@yourstore or URL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="pinterest"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pinterest
              </label>
              <input
                type="text"
                id="pinterest"
                value={formData.pinterest}
                onChange={(e) =>
                  setFormData({ ...formData, pinterest: e.target.value })
                }
                placeholder="@yourstore or URL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="youtube"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                YouTube
              </label>
              <input
                type="text"
                id="youtube"
                value={formData.youtube}
                onChange={(e) =>
                  setFormData({ ...formData, youtube: e.target.value })
                }
                placeholder="Channel URL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                LinkedIn
              </label>
              <input
                type="text"
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                placeholder="Company or profile URL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              loading ||
              !formData.name ||
              !formData.description ||
              formData.categories.length === 0 ||
              formData.types.length === 0
            }
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Business"}
          </button>
        </div>
      </form>
    </div>
  );
}
