"use client";

import { useEffect, useState, useRef } from "react";
import { Store, StoreCategory } from "@/types/store";
import { categoryPinColors } from "@/lib/categoryConfig";

interface MapProps {
  stores: Store[];
  center?: [number, number];
  zoom?: number;
}

function buildPinSvg(categories: StoreCategory[]): string {
  const colors = categories
    .map((c) => categoryPinColors[c])
    .filter(Boolean)
    .slice(0, 3);

  if (colors.length === 0) colors.push("#6b7280");

  const w = 28;
  const h = 40;
  const stripeWidth = w / colors.length;

  const rects = colors
    .map(
      (color, i) =>
        `<rect x="${i * stripeWidth}" y="0" width="${stripeWidth + 0.5}" height="${h}" fill="${color}"/>`
    )
    .join("");

  const clipId = `pc${categories.join("").replace(/[^a-z]/g, "").slice(0, 8)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <clipPath id="${clipId}">
        <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z"/>
      </clipPath>
    </defs>
    <g clip-path="url(#${clipId})">${rects}</g>
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="none" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="4.5" fill="white" opacity="0.9"/>
  </svg>`;
}

export default function Map({
  stores,
  center = [39.8283, -98.5795],
  zoom = 4,
}: MapProps) {
  const [leafletReady, setLeafletReady] = useState(false);
  const modulesRef = useRef<any>({});
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Dynamic import
    Promise.all([import("leaflet")]).then(([leaflet]) => {
      modulesRef.current.L = leaflet.default;
      setLeafletReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      document.head.removeChild(link);
    };
  }, []);

  // Initialize map once
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return;

    const L = modulesRef.current.L;
    const map = L.map(containerRef.current).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Force a resize check after mount
    setTimeout(() => map.invalidateSize(), 100);
  }, [leafletReady, center, zoom]);

  // Update markers when stores change
  useEffect(() => {
    if (!leafletReady || !mapRef.current || !markersRef.current) return;

    const L = modulesRef.current.L;
    markersRef.current.clearLayers();

    const storesWithCoords = stores.filter((s) => s.location.coordinates);

    storesWithCoords.forEach((store) => {
      const svg = buildPinSvg(store.categories);
      const icon = L.divIcon({
        html: svg,
        className: "",
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(
        [store.location.coordinates!.lat, store.location.coordinates!.lng],
        { icon }
      );

      const categoryDots = store.categories
        .map(
          (cat) =>
            `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${categoryPinColors[cat] || "#6b7280"}" title="${cat.replace(/-/g, " ")}"></span>`
        )
        .join(" ");

      marker.bindPopup(`
        <div style="min-width:200px">
          <h3 style="font-weight:600;color:#111;margin:0">${store.name}</h3>
          <p style="font-size:13px;color:#6b7280;margin:2px 0">${store.location.city}, ${store.location.state}</p>
          <div style="display:flex;gap:4px;margin-top:6px">${categoryDots}</div>
          ${store.description ? `<p style="font-size:13px;color:#4b5563;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${store.description}</p>` : ""}
          <a href="/stores/${store.id}" style="font-size:13px;color:#16a34a;font-weight:500;margin-top:8px;display:inline-block">View details →</a>
        </div>
      `);

      markersRef.current.addLayer(marker);
    });
  }, [leafletReady, stores]);

  if (!leafletReady) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
