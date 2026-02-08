"use client";

import { useEffect, useState } from "react";
import { Store } from "@/types/store";

interface MapProps {
  stores: Store[];
  center?: [number, number];
  zoom?: number;
}

export default function Map({
  stores,
  center = [39.8283, -98.5795],
  zoom = 4,
}: MapProps) {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Popup, setPopup] = useState<any>(null);
  const [L, setL] = useState<any>(null);
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => setCssLoaded(true);
    document.head.appendChild(link);

    // Dynamic import of Leaflet on client side only
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([reactLeaflet, leaflet]) => {
        setMapContainer(() => reactLeaflet.MapContainer);
        setTileLayer(() => reactLeaflet.TileLayer);
        setMarker(() => reactLeaflet.Marker);
        setPopup(() => reactLeaflet.Popup);
        setL(leaflet.default);
      }
    );

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!MapContainer || !TileLayer || !Marker || !Popup || !L || !cssLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Custom marker icon
  const customIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const storesWithCoords = stores.filter((s) => s.location.coordinates);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {storesWithCoords.map((store) => (
        <Marker
          key={store.id}
          position={[
            store.location.coordinates!.lat,
            store.location.coordinates!.lng,
          ]}
          icon={customIcon}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-gray-900">{store.name}</h3>
              <p className="text-sm text-gray-500">
                {store.location.city}, {store.location.state}
              </p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {store.description}
              </p>
              <a
                href={`/stores/${store.id}`}
                className="text-sm text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
              >
                View details →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
