"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, MapPin, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

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
      toast.success("Ubicación seleccionada", {
        description: "La ubicación ha sido guardada automáticamente",
      });
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
      toast.success("Ubicación seleccionada", {
        description: "La ubicación ha sido guardada automáticamente",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles", {
      description: "La información ha sido copiada",
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
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

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Información de ubicación</CardTitle>
            <CardDescription>
              Detalles de la ubicación seleccionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLocation ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Dirección
                  </h3>
                  <div className="p-3 bg-muted rounded-md relative group">
                    <p className="text-sm break-words pr-8">
                      {selectedLocation.address}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 opacity-50 group-hover:opacity-100"
                      onClick={() => copyToClipboard(selectedLocation.address)}
                    >
                      <Clipboard className="h-4 w-4" />
                      <span className="sr-only">Copiar dirección</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Coordenadas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground">Latitud</p>
                      <p className="text-sm font-medium">
                        {selectedLocation.lat.toFixed(6)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground">Longitud</p>
                      <p className="text-sm font-medium">
                        {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() =>
                      copyToClipboard(
                        `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
                      )
                    }
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copiar coordenadas
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  Ninguna ubicación seleccionada
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Busca una dirección o haz clic en el mapa para seleccionar una
                  ubicación ó puedes pegar las coordenadas de google maps para
                  mayor exactitud
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
