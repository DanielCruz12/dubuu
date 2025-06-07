"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface LeafletMapComponentProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

interface SearchSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface PlacePhoto {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

// Definir las diferentes capas de mapa disponibles
const mapLayers = {
  light: {
    name: "Claro",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    filter: "saturate(0.8) brightness(1.03)",
  },
  dark: {
    name: "Oscuro",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    filter: "brightness(0.9)",
  },
  satellite: {
    name: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    filter: "none",
  },
  terrain: {
    name: "Terreno",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    filter: "none",
  },
  standard: {
    name: "Estándar",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    filter: "none",
  },
};

export default function LeafletMapComponent({
  onLocationSelect,
  selectedLocation,
}: LeafletMapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const currentLayerRef = useRef<L.TileLayer | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayer, setSelectedLayer] =
    useState<keyof typeof mapLayers>("satellite");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placePhotos, setPlacePhotos] = useState<PlacePhoto[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SearchSuggestion | null>(
    null
  );

  useEffect(() => {
    // Inicializar el mapa si no existe
    if (!mapRef.current) {
      mapRef.current = L.map("location-map", {
        center: [13.8447, -89.6306], // El Salvador por defecto
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      // Configurar iconos de Leaflet
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Manejar clics en el mapa
      mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
        setShowSuggestions(false);
      });

      // Intentar obtener la ubicación actual del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (mapRef.current) {
              mapRef.current.setView(
                [position.coords.latitude, position.coords.longitude],
                13
              );
            }
          },
          () => {
            console.log("Error al obtener la ubicación o permiso denegado");
          }
        );
      }
    }

    // Cambiar la capa del mapa
    if (mapRef.current) {
      // Remover la capa actual si existe
      if (currentLayerRef.current) {
        mapRef.current.removeLayer(currentLayerRef.current);
      }

      // Añadir la nueva capa
      const layer = mapLayers[selectedLayer];
      currentLayerRef.current = L.tileLayer(layer.url, {
        maxZoom: 19,
        attribution: layer.attribution,
      }).addTo(mapRef.current);

      // Aplicar filtro CSS si es necesario
      const mapContainer = document.getElementById("location-map");
      if (mapContainer) {
        const tilePane = mapContainer.querySelector(
          ".leaflet-tile-pane"
        ) as HTMLElement;
        if (tilePane) {
          tilePane.style.filter = layer.filter;
        }
      }
    }

    // Limpiar marcador existente
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Añadir marcador si hay una ubicación seleccionada
    if (selectedLocation && mapRef.current) {
      markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(mapRef.current)
        .bindPopup(
          createLocationPopup(selectedLocation.lat, selectedLocation.lng)
        )
        .openPopup();

      // Centrar el mapa en la ubicación seleccionada
      mapRef.current.setView(
        [selectedLocation.lat, selectedLocation.lng],
        mapRef.current.getZoom()
      );
    }

    // Cleanup function
    return () => {
      // No destruimos el mapa en cleanup para evitar problemas de re-inicialización
    };
  }, [selectedLocation, onLocationSelect, selectedLayer]);

  // Crear popup con información del lugar y fotos
  const createLocationPopup = (lat: number, lng: number) => {
    const popupContent = document.createElement("div");
    popupContent.className = "location-popup";

    let photosHtml = "";
    if (placePhotos.length > 0) {
      photosHtml = `
        <div class="photos-container mb-3">
          <div class="photos-grid">
            ${placePhotos
              .slice(0, 3)
              .map(
                (photo) => `
              <img src="${photo.urls.small}" alt="${photo.alt_description || "Foto del lugar"}" 
                   class="photo-item" loading="lazy" />
            `
              )
              .join("")}
          </div>
          ${placePhotos.length > 3 ? `<div class="more-photos">+${placePhotos.length - 3} más</div>` : ""}
        </div>
      `;
    }

    popupContent.innerHTML = `
      <div class="popup-content">
        ${photosHtml}
        <div class="location-info">
          ${
            selectedPlace
              ? `
            <h3 class="place-title">${selectedPlace.display_name.split(",")[0]}</h3>
            <p class="place-address">${selectedPlace.display_name}</p>
            <div class="place-rating">
              <Star class="star-icon" />
              <span>Lugar verificado</span>
            </div>
          `
              : ""
          }
          <div class="coordinates">
            <strong>Coordenadas:</strong><br/>
            Lat: ${lat.toFixed(6)}<br/>
            Lng: ${lng.toFixed(6)}
          </div>
        </div>
      </div>
    `;

    return popupContent;
  };

  // Buscar sugerencias mientras el usuario escribe
  const searchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Buscar en múltiples fuentes para mejor cobertura
      const queries = [
        // Búsqueda específica en El Salvador
        `${query} El Salvador`,
        // Búsqueda en Centroamérica
        query,
        // Búsqueda de gasolineras específicamente
        query.toLowerCase().includes("puma") ||
        query.toLowerCase().includes("gasolinera")
          ? `fuel station ${query} El Salvador`
          : null,
      ].filter(Boolean);

      const allResults: SearchSuggestion[] = [];

      for (const searchQuery of queries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery!)}&limit=5&countrycodes=sv,gt,hn,ni,cr,pa,bz&addressdetails=1&extratags=1`,
          {
            headers: { "Accept-Language": "es" },
          }
        );

        const data = await response.json();
        if (data && data.length > 0) {
          allResults.push(...data);
        }
      }

      // Eliminar duplicados y ordenar por importancia
      const uniqueResults = allResults
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.place_id === item.place_id)
        )
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 8);

      setSuggestions(uniqueResults);
      setShowSuggestions(uniqueResults.length > 0);
    } catch (error) {
      console.error("Error al buscar sugerencias:", error);
    }
  };

  // Buscar fotos del lugar
  const searchPlacePhotos = async (placeName: string) => {
    try {
      // Limpiar el nombre del lugar para la búsqueda
      const cleanPlaceName = placeName.split(",")[0].trim();
      const searchTerms = [
        cleanPlaceName,
        `${cleanPlaceName} El Salvador`,
        cleanPlaceName.includes("gasolinera")
          ? "gas station El Salvador"
          : cleanPlaceName,
      ];

      for (const term of searchTerms) {
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=6&orientation=landscape`,
            {
              headers: {
                Authorization:
                  "Client-ID 8XJLFd7_7QgVm5PZN8YzqHQqGVqKB8KqGVqKB8KqGVq", // Clave demo de Unsplash
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              setPlacePhotos(data.results);
              break;
            }
          }
        } catch (error) {
          console.log(`Error buscando fotos para ${term}:`, error);
        }
      }
    } catch (error) {
      console.error("Error al buscar fotos:", error);
    } finally {
    }
  };

  // Manejar cambios en el input de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Buscar sugerencias después de 300ms
    searchTimeoutRef.current = setTimeout(() => {
      searchSuggestions(value);
    }, 300);
  };

  // Seleccionar una sugerencia
  const selectSuggestion = async (suggestion: SearchSuggestion) => {
    const lat = Number.parseFloat(suggestion.lat);
    const lng = Number.parseFloat(suggestion.lon);

    setSearchQuery(suggestion.display_name.split(",")[0]);
    setShowSuggestions(false);
    setSelectedPlace(suggestion);

    // Buscar fotos del lugar
    await searchPlacePhotos(suggestion.display_name);

    // Centrar el mapa en el resultado
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16);
    }

    // Seleccionar la ubicación
    onLocationSelect(lat, lng);

    toast.success("Ubicación encontrada", {
      description: suggestion.display_name.split(",").slice(0, 2).join(", "),
    });
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La geolocalización no está disponible en tu navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
        }

        // Seleccionar la ubicación actual
        onLocationSelect(lat, lng);

        toast.success("Ubicación actual obtenida");
      },
      (error) => {
        console.error("Error al obtener ubicación:", error);
        toast.error("No se pudo obtener tu ubicación actual", {
          description: "Verifica que hayas dado permisos de ubicación",
        });
      }
    );
  };

  // Añadir estilos CSS personalizados
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-popup-content-wrapper {
        border-radius: 12px;
        padding: 0;
        overflow: hidden;
        min-width: 280px;
      }
      
      .leaflet-popup-content {
        margin: 0;
        width: auto !important;
      }
      
      .leaflet-container {
        font-family: inherit;
      }
      
      .map-search-overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        z-index: 1000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 12px;
      }
      
      .dark .map-search-overlay {
        background: #1f2937;
        border: 1px solid #374151;
      }
      
      .map-layer-selector {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 8px;
        min-width: 150px;
      }
      
      .dark .map-layer-selector {
        background: #1f2937;
        border: 1px solid #374151;
      }
      
      .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1001;
        margin-top: 4px;
      }
      
      .dark .suggestions-dropdown {
        background: #1f2937;
        border: 1px solid #374151;
      }
      
      .suggestion-item {
        padding: 12px;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s;
      }
      
      .dark .suggestion-item {
        border-bottom-color: #374151;
      }
      
      .suggestion-item:hover {
        background-color: #f9fafb;
      }
      
      .dark .suggestion-item:hover {
        background-color: #374151;
      }
      
      .suggestion-item:last-child {
        border-bottom: none;
      }
      
      .suggestion-title {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 2px;
      }
      
      .suggestion-address {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.3;
      }
      
      .dark .suggestion-address {
        color: #9ca3af;
      }
      
      .popup-content {
        padding: 0;
      }
      
      .photos-container {
        position: relative;
      }
      
      .photos-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2px;
        height: 120px;
      }
      
      .photo-item {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .more-photos {
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
      }
      
      .location-info {
        padding: 12px;
      }
      
      .place-title {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 4px;
        color: #111827;
      }
      
      .dark .place-title {
        color: white;
      }
      
      .place-address {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .dark .place-address {
        color: #9ca3af;
      }
      
      .place-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #059669;
        margin-bottom: 8px;
      }
      
      .star-icon {
        width: 12px;
        height: 12px;
        fill: currentColor;
      }
      
      .coordinates {
        font-size: 11px;
        color: #6b7280;
        border-top: 1px solid #f3f4f6;
        padding-top: 8px;
      }
      
      .dark .coordinates {
        color: #9ca3af;
        border-top-color: #374151;
      }
      
      @media (max-width: 640px) {
        .map-search-overlay {
          top: 10px;
          left: 10px;
          right: 10px;
        }
        
        .map-layer-selector {
          top: 80px;
          right: 10px;
          left: 10px;
        }
        
        .leaflet-popup-content-wrapper {
          min-width: 250px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Overlay de búsqueda */}
      <div className="map-search-overlay">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Ej. Gasolinera Puma, El Salvador"
              className="w-full"
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />

            {/* Dropdown de sugerencias */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="suggestion-item"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <div className="suggestion-title">
                      {suggestion.display_name.split(",")[0]}
                    </div>
                    <div className="suggestion-address">
                      {suggestion.display_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={getCurrentLocation} variant="outline" size="sm">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Mi ubicación</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Selector de capas */}
      <div className="map-layer-selector">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">Estilo de mapa</span>
        </div>
        <Select
          value={selectedLayer}
          onValueChange={(value: keyof typeof mapLayers) =>
            setSelectedLayer(value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(mapLayers).map(([key, layer]) => (
              <SelectItem key={key} value={key}>
                {layer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mapa */}
      <div id="location-map" className="w-full h-full z-0" />
    </div>
  );
}
