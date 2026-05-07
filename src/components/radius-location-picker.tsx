"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  GoogleRadiusMapPicker,
  type RadiusLocationSelection,
} from "@/components/google-radius-map-picker";

interface RadiusLocationPickerProps {
  onLocationSelect: (location: RadiusLocationSelection) => void;
  initialLocation?: RadiusLocationSelection | null;
  radiusKm: number;
}

export default function RadiusLocationPicker({
  onLocationSelect,
  initialLocation,
  radiusKm,
}: RadiusLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<RadiusLocationSelection | null>(initialLocation || null);
  const googleApiKey =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      : undefined;

  useEffect(() => {
    if (initialLocation) setSelectedLocation(initialLocation);
  }, [initialLocation]);

  const handleLocationSelect = (location: RadiusLocationSelection) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="w-full">
      <Card className="h-full">
        <CardContent className="p-0 h-[500px]">
          <GoogleRadiusMapPicker
            apiKey={googleApiKey!}
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            radiusKm={radiusKm}
          />
        </CardContent>
      </Card>
    </div>
  );
}
