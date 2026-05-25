"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useLanguage } from "@/lib/i18n-context";
import { GoogleMapPicker, type QuickLocation } from "@/components/google-map-picker";

const LeafletMapComponent = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p>Cargando mapa...</p>
      </div>
    </div>
  ),
});

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location | null;
  quickLocations?: QuickLocation[];
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  quickLocations,
}: LocationPickerProps) {
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const googleApiKey = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_API_KEY : undefined;
  const useGoogleMaps = Boolean(googleApiKey);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleLeafletSelect = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await response.json();
      const newLocation: Location = {
        lat,
        lng,
        address: data?.display_name ? data.display_name : t("dashboard.addTour.location.addressNotFound"),
      };
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
    } catch {
      const newLocation: Location = { lat, lng, address: t("dashboard.addTour.location.addressNotFound") };
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
    }
  };

  return (
    <div className="w-full">
      <Card className="h-full">
        <CardContent className="p-0 h-[500px]">
          {useGoogleMaps ? (
            <GoogleMapPicker
              apiKey={googleApiKey!}
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              quickLocations={quickLocations}
            />
          ) : (
            <LeafletMapComponent
              onLocationSelect={handleLeafletSelect}
              selectedLocation={selectedLocation}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
