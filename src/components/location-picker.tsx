"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";

// Importamos el mapa dinámicamente para evitar problemas de SSR
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
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );

  // Actualizar el estado local cuando cambia la ubicación inicial
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleLocationSelect = async (lat: number, lng: number) => {
    try {
      // Realizar geocodificación inversa usando Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await response.json();

      const newLocation = {
        lat,
        lng,
        address:
          data && data.display_name
            ? data.display_name
            : "Dirección no encontrada",
      };

      setSelectedLocation(newLocation);

      // Guardar automáticamente la ubicación cuando se selecciona
      onLocationSelect(newLocation);
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      const newLocation = {
        lat,
        lng,
        address: "Error al obtener la dirección",
      };
      setSelectedLocation(newLocation);

      // Guardar automáticamente incluso si hay error
      onLocationSelect(newLocation);
    }
  };

  return (
    <div className="w-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Selecciona una ubicación
          </CardTitle>
          <CardDescription>
            Busca una dirección específica o haz clic en el mapa para
            seleccionar una ubicación
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[500px]">
          <LeafletMapComponent
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </CardContent>
      </Card>
    </div>
  );
}
