"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Layers, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n-context";

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
  class?: string;
  extratags?: Record<string, string>;
}

// Definir las diferentes capas de mapa disponibles
const mapLayers = {
  grayscale: {
    name: "Blanco y Negro",
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    filter: "grayscale(100%) contrast(120%)",
  },
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
  const { t } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const currentLayerRef = useRef<L.TileLayer | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayer, setSelectedLayer] =
    useState<keyof typeof mapLayers>("satellite");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SearchSuggestion | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);

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
    // createLocationPopup se define debajo y depende de selectedPlace; el efecto ya reacciona a selectedLocation/capa.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- evita re-init del mapa al añadir createLocationPopup
  }, [selectedLocation, onLocationSelect, selectedLayer]);

  // Crear popup con información del lugar y fotos placeholder
  const createLocationPopup = (lat: number, lng: number) => {
    const popupContent = document.createElement("div");
    popupContent.className = "location-popup";

    let placeInfoHtml = "";

    if (selectedPlace) {
      // Determinar el tipo de lugar para mostrar información relevante
      const placeName = selectedPlace.display_name.split(",")[0];
      const placeType = getPlaceTypeInfo(selectedPlace);

      placeInfoHtml = `
        <h3 class="place-title">${placeName}</h3>
        <p class="place-address">${selectedPlace.display_name}</p>
        <div class="place-info-grid">
          <div class="place-type">
            ${getPlaceIcon(selectedPlace)}
            <span>${placeType}</span>
          </div>
        </div>
      `;
    }

    popupContent.innerHTML = `
      <div class="popup-content">
        <div class="location-info">
          ${placeInfoHtml}
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

  // Obtener información del tipo de lugar
  const getPlaceTypeInfo = (place: SearchSuggestion) => {
    const name = place.display_name.toLowerCase();
    const type = place.type || "";
    const placeClass = place.class || "";

    if (
      name.includes("gasolinera") ||
      (placeClass === "amenity" && type === "fuel")
    )
      return "Gasolinera";
    if (name.includes("hotel") || placeClass === "tourism") return "Hotel";
    if (
      name.includes("restaurante") ||
      (placeClass === "amenity" && type === "restaurant")
    )
      return "Restaurante";
    if (name.includes("banco") || (placeClass === "amenity" && type === "bank"))
      return "Banco";
    if (
      name.includes("hospital") ||
      (placeClass === "amenity" && type === "hospital")
    )
      return "Hospital";
    if (
      name.includes("escuela") ||
      (placeClass === "amenity" && type === "school")
    )
      return "Escuela";
    if (
      name.includes("iglesia") ||
      (placeClass === "amenity" && type === "place_of_worship")
    )
      return "Iglesia";
    if (name.includes("parque") || placeClass === "leisure") return "Parque";
    if (name.includes("centro") || name.includes("mall"))
      return "Centro Comercial";
    if (placeClass === "place") return "Lugar";
    return "Ubicación";
  };

  // Obtener icono del tipo de lugar
  const getPlaceIcon = (place: SearchSuggestion) => {
    const name = place.display_name.toLowerCase();
    const type = place.type || "";
    const placeClass = place.class || "";

    if (
      name.includes("gasolinera") ||
      (placeClass === "amenity" && type === "fuel")
    ) {
      return `<svg class="place-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h8a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 7a1 1 0 012 0v6.293l1.707 1.707a1 1 0 01-1.414 1.414L15 15.121V17a1 1 0 11-2 0V7z"/></svg>`;
    }
    if (name.includes("hotel")) {
      return `<svg class="place-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>`;
    }
    if (name.includes("restaurante")) {
      return `<svg class="place-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 10-2 0v8a1 1 0 102 0V9z"/></svg>`;
    }
    return `<svg class="place-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>`;
  };

  // Buscar sugerencias mientras el usuario escribe
  const searchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

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
    } finally {
      setIsSearching(false);
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

    // Centrar el mapa en el resultado
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16);
    }

    // Seleccionar la ubicación
    onLocationSelect(lat, lng);
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
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
      },
      (error) => {
        console.error("Error al obtener ubicación:", error);
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
        min-width: 300px;
        max-width: 350px;
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
        background: #f3f4f6;
      }
      
      .location-info {
        padding: 16px;
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
        margin-bottom: 12px;
        line-height: 1.4;
      }
      
      .dark .place-address {
        color: #9ca3af;
      }
      
      .place-info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .place-type {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        padding: 6px 8px;
        background: #f9fafb;
        border-radius: 6px;
        color: #374151;
      }
      
      .dark .place-type {
        background: #374151;
        color: #d1d5db;
      }
      
      .place-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }
      
      .coordinates {
        font-size: 11px;
        color: #6b7280;
        border-top: 1px solid #f3f4f6;
        padding-top: 12px;
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
          min-width: 280px;
          max-width: 320px;
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
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("dashboard.addTour.location.searchPlaceholder")}
                className="w-full pr-10"
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

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
              <span className="hidden sm:inline ml-2">{t("dashboard.addTour.location.myLocation")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Selector de capas */}
      <div className="map-layer-selector">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">{t("dashboard.addTour.location.mapTypeLabel")}</span>
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
