"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Location {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  price: number;
  images: string[];
  rating: number;
  type: string;
  amenities: string[];
}

interface MapProps {
  locations: Location[];
  selectedLocation: string | null;
  onMarkerClick: (locationId: string) => void;
}

export default function Map({
  locations,
  selectedLocation,
  onMarkerClick,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const popupsRef = useRef<{ [key: string]: L.Popup }>({});

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [40.712776, -74.005974],
        zoom: 13,
        zoomControl: true,
        attributionControl: false, // Hide attribution for cleaner look
      });

      // Add custom tile layer for Airbnb-like style
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ).addTo(mapRef.current);
    }

    // Clear existing markers and popups
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    Object.values(popupsRef.current).forEach((popup) => {
      popup.remove();
    });
    popupsRef.current = {};

    // Add markers for each location
    locations.forEach((location) => {
      // Create custom icon for marker
      const isSelected = selectedLocation === location.id;

      // Create custom HTML for marker
      const markerHtml = document.createElement("div");
      markerHtml.className = `flex items-center justify-center ${isSelected ? "text-white bg-primary" : "text-white bg-secondary-foreground"} rounded-full p-1 shadow-lg border-2 ${isSelected ? "border-primary" : "border-white"} transition-all duration-200 hover:scale-110 dark:bg-black dark:text-white dark:border-black`;
      markerHtml.style.width = "48px";
      markerHtml.style.height = "32px";
      markerHtml.innerHTML = `<span class="font-semibold text-xs">$${location.price}</span>`;

      const icon = L.divIcon({
        html: markerHtml,
        className: "custom-marker",
        iconSize: [48, 32],
        iconAnchor: [24, 32],
      });

      // Create popup with location info
      const popupContent = document.createElement("div");
      popupContent.className = "map-popup";
      popupContent.innerHTML = `
        <div class="w-64 overflow-hidden">
          <div class="relative w-full h-32 mb-2">
            <img src="${location.images[0]}" alt="${location.title}" class="absolute inset-0 w-full h-full object-cover rounded-t-lg" />
            <div class="absolute top-2 left-2 text-xs px-2 py-1 rounded-full">${location.type}</div>
          </div>
          <div class="p-2">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-medium text-sm">${location.title}</h3>
              <div class="flex items-center gap-1 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <span>${location.rating}</span>
              </div>
            </div>
            <p class="text-xs line-clamp-2 mb-2">${location.description}</p>
            <div class="font-semibold text-sm">$${location.price} <span class="text-xs font-normal">night</span></div>
          </div>
        </div>
      `;

      const popup = L.popup({
        className: "custom-popup",
        maxWidth: 300,
        offset: [0, -20],
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
      }).setContent(popupContent);

      popupsRef.current[location.id] = popup;

      // Create marker
      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(mapRef.current!)
        .on("click", () => {
          // Close all other popups
          Object.values(popupsRef.current).forEach((p) => {
            mapRef.current?.closePopup(p);
          });

          // Open this popup and trigger selection
          marker.bindPopup(popup).openPopup();
          onMarkerClick(location.id);
        });

      // If this is the selected location, open its popup
      if (isSelected) {
        marker.bindPopup(popup).openPopup();
      }

      // Store marker reference
      markersRef.current[location.id] = marker;
    });

    // Center map on selected location
    if (selectedLocation && markersRef.current[selectedLocation]) {
      const marker = markersRef.current[selectedLocation];
      const position = marker.getLatLng();
      mapRef.current.setView(position, 14);

      // Open the popup for the selected location
      marker.bindPopup(popupsRef.current[selectedLocation]).openPopup();
    } else if (locations.length > 0) {
      // If no location is selected, fit map to show all markers
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup function
    return () => {
      // We don't destroy the map on cleanup to prevent re-initialization issues
      // Just clean up markers if needed
    };
  }, [locations, selectedLocation, onMarkerClick]);
  useEffect(() => {
    // Add custom CSS for the popup
    const style = document.createElement("style");
    style.textContent = `
.custom-popup .leaflet-popup-content-wrapper {
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
}

.dark .custom-popup .leaflet-popup-content-wrapper {
  background: #000000;
  color: white;
}

.custom-popup .leaflet-popup-content {
  margin: 0;
  width: auto !important;
}

.custom-popup .leaflet-popup-tip {
  background: white;
}

.dark .custom-popup .leaflet-popup-tip {
  background: #000000;
}

.custom-popup .leaflet-popup-close-button {
  color: white;
  top: 8px;
  right: 8px;
  z-index: 10;
}

/* Airbnb-like map styling */
.leaflet-tile-pane {
  filter: saturate(0.8) brightness(1.03);
}

.dark .leaflet-tile-pane {
  filter: saturate(0.7) brightness(0.8) invert(1) hue-rotate(180deg);
}

/* Mobile popup styling */
.mobile-custom-popup {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  margin: auto !important;
  transform: none !important;
  width: 100% !important;
  max-width: 100% !important;
}

.mobile-custom-popup .leaflet-popup-content-wrapper {
  border-radius: 12px 12px 0 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}

.mobile-custom-popup .leaflet-popup-content {
  width: 100% !important;
  margin: 0 !important;
}

.mobile-custom-popup .leaflet-popup-tip-container {
  display: none !important;
}

.mobile-popup {
  width: 100% !important;
}

.dark .mobile-popup h3,
.dark .mobile-popup .font-semibold {
  color: white;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .custom-popup {
    max-width: 90% !important;
  }
  .custom-popup .leaflet-popup-content-wrapper {
    max-width: 100%;
  }
  .custom-popup .map-popup img {
    height: 120px !important;
  }
}
`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <div id="map" className="w-full h-full z-0" />;
}
