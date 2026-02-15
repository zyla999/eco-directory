import Image from "next/image";
import { Sponsor } from "@/types/store";

interface SponsorCardProps {
  sponsor: Sponsor;
  variant: "banner" | "sidebar";
}

export default function SponsorCard({ sponsor, variant }: SponsorCardProps) {
  // Image or video ad — used for both variants when media is provided
  if (sponsor.image || sponsor.video) {
    return (
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-2 border-amber-200 bg-amber-50/50 rounded-lg overflow-hidden hover:shadow-md transition"
      >
        <div className="relative max-h-[280px] overflow-hidden">
          <span className="absolute top-2 left-2 z-10 text-xs font-medium text-amber-600 bg-amber-50/90 px-2 py-0.5 rounded uppercase tracking-wider">
            Sponsored
          </span>
          {sponsor.video ? (
            <video
              src={sponsor.video}
              autoPlay
              muted
              loop
              playsInline
              className="w-full object-cover"
              style={{ maxHeight: "280px" }}
            />
          ) : (
            <Image
              src={sponsor.image!}
              alt={`${sponsor.name} ad`}
              width={1200}
              height={280}
              className="w-full object-cover"
              style={{ maxHeight: "280px" }}
            />
          )}
        </div>
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {sponsor.logo && (
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                width={40}
                height={40}
                className="w-10 h-10 object-contain rounded flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate block">
                {sponsor.name}
              </span>
              {sponsor.description && (
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                  {sponsor.description}
                </p>
              )}
            </div>
          </div>
          {sponsor.cta && (
            <span className="bg-amber-500 text-white text-xs px-4 py-1.5 rounded-lg font-medium hover:bg-amber-600 transition whitespace-nowrap flex-shrink-0">
              {sponsor.cta}
            </span>
          )}
        </div>
      </a>
    );
  }

  // Text-based fallback — banner variant
  if (variant === "banner") {
    return (
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-2 border-amber-200 bg-amber-50/50 rounded-xl p-6 md:p-8 hover:shadow-md transition"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Image
            src={sponsor.logo}
            alt={`${sponsor.name} logo`}
            width={80}
            height={80}
            className="w-20 h-20 object-contain rounded-lg"
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                Sponsored
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {sponsor.name}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{sponsor.description}</p>
          </div>
          <span className="inline-block bg-amber-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-amber-600 transition whitespace-nowrap">
            {sponsor.cta}
          </span>
        </div>
      </a>
    );
  }

  // Text-based fallback — sidebar variant
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-amber-200 bg-amber-50/50 rounded-lg p-4 hover:shadow-md transition"
    >
      <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
        Sponsored
      </span>
      <div className="flex items-center gap-3 mt-2">
        <Image
          src={sponsor.logo}
          alt={`${sponsor.name} logo`}
          width={48}
          height={48}
          className="w-12 h-12 object-contain rounded"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {sponsor.name}
          </h4>
          <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
            {sponsor.description}
          </p>
        </div>
      </div>
      <span className="inline-block mt-3 bg-amber-500 text-white text-sm px-4 py-1.5 rounded-lg font-medium hover:bg-amber-600 transition w-full text-center">
        {sponsor.cta}
      </span>
    </a>
  );
}
