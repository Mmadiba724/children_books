import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";

interface MapProps {
  selectedLocation?: { lat: number; lng: number } | null;
  onSelectLocation: (coords: { lat: number; lng: number }) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const defaultCenter = { lat: 0.3476, lng: 32.5825 };

export default function Map({
  selectedLocation,
  onSelectLocation,
  center = defaultCenter,
  zoom = 10,
}: MapProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    selectedLocation ?? null,
  );

  useEffect(() => {
    setMarker(selectedLocation ?? null);
  }, [selectedLocation]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  if (!apiKey) {
    return (
      <div className="p-4 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded">
        Google Maps API key is not configured. Please set
        <code className="ml-1 font-mono">VITE_GOOGLE_MAPS_API_KEY</code>.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
        Failed to load Google Maps. Please check your API key and network.
      </div>
    );
  }

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      center={center}
      zoom={zoom}
      mapContainerStyle={{ width: "100%", height: "100%" }}
      onClick={(e: any) => {
        if (!e.latLng) return;
        const coords = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        };
        setMarker(coords);
        onSelectLocation(coords);
      }}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  );
}
