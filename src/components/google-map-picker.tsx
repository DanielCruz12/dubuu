"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Layers, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

type MapTypeId = "roadmap" | "satellite" | "hybrid" | "terrain";

const DEFAULT_CENTER = { lat: 13.8447, lng: -89.6306 }; // El Salvador
const GEOCODE_CACHE_MAX = 50;
const MAP_CLICK_DEBOUNCE_MS = 400;

function geocodeCacheKey(lat: number, lng: number): string {
  const r = 10000;
  return `${Math.round(lat * r) / r},${Math.round(lng * r) / r}`;
}

export interface LocationSelection {
  lat: number;
  lng: number;
  address: string;
}

interface GoogleMapPickerProps {
  onLocationSelect: (location: LocationSelection) => void;
  selectedLocation: LocationSelection | null;
  apiKey: string;
}

export function GoogleMapPicker({
  onLocationSelect,
  selectedLocation,
  apiKey,
}: GoogleMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const placeAutocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapTypeId>("roadmap");
  const geocodeCacheRef = useRef<Map<string, string>>(new Map());
  const clickDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Initialize map and Place Autocomplete (New API - solo Places API New)
  useEffect(() => {
    if (!apiKey || !mapContainerRef.current) return;

    const containerRef = autocompleteContainerRef.current;
    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(async (google) => {
        if (!mapContainerRef.current) return;

        await google.maps.importLibrary("places");

        const map = new google.maps.Map(mapContainerRef.current, {
          center: selectedLocation
            ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
            : DEFAULT_CENTER,
          zoom: selectedLocation ? 16 : 13,
          zoomControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
        });

        mapRef.current = map;
        map.setMapTypeId(mapType);

        const addMarker = (lat: number, lng: number) => {
          if (markerRef.current) {
            (markerRef.current as google.maps.Marker).setMap(null);
            markerRef.current = null;
          }
          const marker = new google.maps.Marker({
            map,
            position: { lat, lng },
            title: t("dashboard.addTour.location.meetingPointTitle"),
          });
          (markerRef as React.MutableRefObject<google.maps.Marker | null>).current = marker;
        };

        const geocoder = new google.maps.Geocoder();
        const cache = geocodeCacheRef.current;
        const addressNotFound = t("dashboard.addTour.location.addressNotFound");

        const resolveAddress = (lat: number, lng: number, done: (address: string) => void) => {
          const key = geocodeCacheKey(lat, lng);
          const cached = cache.get(key);
          if (cached !== undefined) {
            done(cached);
            return;
          }
          geocoder.geocode(
            { location: { lat, lng } },
            (
              results: google.maps.GeocoderResult[] | null,
              status: google.maps.GeocoderStatus
            ) => {
              const address =
                status === google.maps.GeocoderStatus.OK && results?.[0]
                  ? results[0].formatted_address
                  : addressNotFound;
              if (cache.size >= GEOCODE_CACHE_MAX) {
                const firstKey = cache.keys().next().value;
                if (firstKey !== undefined) cache.delete(firstKey);
              }
              cache.set(key, address);
              done(address);
            }
          );
        };

        clickListenerRef.current = map.addListener("click", (e: google.maps.MapMouseEvent) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat == null || lng == null) return;
          addMarker(lat, lng);
          if (clickDebounceRef.current != null) clearTimeout(clickDebounceRef.current);
          clickDebounceRef.current = setTimeout(() => {
            clickDebounceRef.current = null;
            resolveAddress(lat, lng, (address) => {
              onLocationSelect({ lat, lng, address });
            });
          }, MAP_CLICK_DEBOUNCE_MS);
        });

        // Place Autocomplete Element (Places API New) - sin API legada
        if (containerRef) {
          const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
            locationBias: map.getBounds() ?? undefined,
          });
          placeAutocomplete.id = "place-autocomplete-input";
          containerRef.innerHTML = "";
          containerRef.appendChild(placeAutocomplete);
          placeAutocompleteRef.current = placeAutocomplete;

          const handlePlaceSelect = async (ev: Event) => {
            const payload = (ev as CustomEvent<{ placePrediction?: { toPlace: () => google.maps.places.Place | Promise<google.maps.places.Place> } }>).detail
              ?? (ev as { placePrediction?: { toPlace: () => google.maps.places.Place | Promise<google.maps.places.Place> } });
            const placePrediction = payload.placePrediction;
            if (!placePrediction?.toPlace) return;
            const place = await Promise.resolve(placePrediction.toPlace());
            await place.fetchFields({ fields: ["displayName", "formattedAddress", "location"] });
            const loc = place.location;
            if (!loc) return;
            const lat = typeof (loc as google.maps.LatLng).lat === "function" ? (loc as google.maps.LatLng).lat() : (loc as unknown as { lat: number }).lat;
            const lng = typeof (loc as google.maps.LatLng).lng === "function" ? (loc as google.maps.LatLng).lng() : (loc as unknown as { lng: number }).lng;
            const addr = place as { formattedAddress?: string; displayName?: string };
            const address = addr.formattedAddress ?? addr.displayName ?? t("dashboard.addTour.location.addressNotFound");
            addMarker(lat, lng);
            onLocationSelect({ lat, lng, address });
            map.setCenter({ lat, lng });
            map.setZoom(16);
          };
          placeAutocomplete.addEventListener("gmp-select", handlePlaceSelect);
        }

        // Initial marker if we have a selected location
        if (selectedLocation) {
          addMarker(selectedLocation.lat, selectedLocation.lng);
          map.setCenter({
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          });
          map.setZoom(16);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              map.setCenter({ lat, lng });
              map.setZoom(13);
            },
            () => {}
          );
        }

        setIsLoading(false);
      })
      .catch((err) => {
        setLoadError(err?.message || "Error loading Google Maps");
        setIsLoading(false);
      });

    return () => {
      if (clickDebounceRef.current != null) clearTimeout(clickDebounceRef.current);
      clickListenerRef.current?.remove();
      clickListenerRef.current = null;
      const placeEl = placeAutocompleteRef.current;
      if (placeEl && containerRef?.contains(placeEl)) {
        try {
          placeEl.remove();
        } catch {
          /* ignore */
        }
        placeAutocompleteRef.current = null;
      }
      if (markerRef.current) {
        (markerRef.current as google.maps.Marker).setMap(null);
      }
      mapRef.current = null;
      markerRef.current = null;
    };
    // selectedLocation solo para centro/zoom inicial; omitido en deps para no recrear mapa al seleccionar
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial mount only for map center
  }, [apiKey, onLocationSelect, t]);

  // Keep marker in sync when selectedLocation changes from outside (e.g. initial load)
  useEffect(() => {
    if (!mapRef.current || !selectedLocation || typeof window === "undefined" || !window.google?.maps) return;

    const lat = selectedLocation.lat;
    const lng = selectedLocation.lng;
    const g = window.google.maps;
    mapRef.current.setCenter({ lat, lng });
    mapRef.current.setZoom(16);

    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    markerRef.current = new g.Marker({
      map: mapRef.current,
      position: { lat, lng },
      title: t("dashboard.addTour.location.meetingPointTitle"),
    });
  }, [selectedLocation, t]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation || typeof window === "undefined" || !window.google?.maps) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (mapRef.current) {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(16);
        }
        const cache = geocodeCacheRef.current;
        const key = geocodeCacheKey(lat, lng);
        const cached = cache.get(key);
        if (cached !== undefined) {
          onLocationSelect({ lat, lng, address: cached });
          return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat, lng } },
          (
            results: google.maps.GeocoderResult[] | null,
            status: google.maps.GeocoderStatus
          ) => {
            const address =
              status === google.maps.GeocoderStatus.OK && results?.[0]
                ? results[0].formatted_address
                : t("dashboard.addTour.location.addressNotFound");
            if (cache.size >= GEOCODE_CACHE_MAX) {
              const firstKey = cache.keys().next().value;
              if (firstKey !== undefined) cache.delete(firstKey);
            }
            cache.set(key, address);
            onLocationSelect({ lat, lng, address });
          }
        );
      },
      () => {}
    );
  };

  if (loadError) {
    const isRefererError = /RefererNotAllowed|referer/i.test(loadError);
    return (
      <div className="flex h-[500px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
        <p>{isRefererError ? t("dashboard.addTour.location.mapBlockedByKey") : loadError}</p>
        {isRefererError && (
          <p className="max-w-sm text-xs">
            {t("dashboard.addTour.location.mapBlockedHint")}{" "}
            <code className="rounded bg-black/20 px-1">http://localhost:3000/*</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Search bar arriba, botón Mi ubicación abajo */}
      <div className="absolute left-2 right-2 top-2 z-[1000] flex flex-col gap-2">
        <div ref={autocompleteContainerRef} className="min-h-10 w-full [&_input]:rounded-md [&_input]:border [&_input]:bg-background/95 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:shadow-md [&_input]:backdrop-blur" />
        <div className="flex w-[155px] flex-col gap-2 self-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="w-full justify-center bg-background/95 shadow-md backdrop-blur"
          >
            <MapPin className="h-4 w-4" />
            <span className="ml-2">{t("dashboard.addTour.location.myLocation")}</span>
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Select
              value={mapType}
              onValueChange={(value: MapTypeId) => {
                setMapType(value);
                mapRef.current?.setMapTypeId(value);
              }}
            >
              <SelectTrigger className="h-9 min-w-0 flex-1 bg-background/95 shadow-md backdrop-blur [&>span]:truncate" aria-label={t("dashboard.addTour.location.mapTypeLabel")}>
                <SelectValue />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="roadmap">{t("dashboard.addTour.location.mapTypeRoadmap")}</SelectItem>
              <SelectItem value="satellite">{t("dashboard.addTour.location.mapTypeSatellite")}</SelectItem>
              <SelectItem value="hybrid">{t("dashboard.addTour.location.mapTypeHybrid")}</SelectItem>
              <SelectItem value="terrain">{t("dashboard.addTour.location.mapTypeTerrain")}</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: 500 }} />

      {/* Info card: selected meeting point (no coordinates) */}
      {selectedLocation && (
        <div className="absolute bottom-2 left-2 right-2 z-[1000] rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur sm:left-2 sm:right-auto sm:max-w-sm">
          <p className="text-xs font-medium text-muted-foreground">
            {t("dashboard.addTour.location.meetingPointLabel")}
          </p>
          <p className="text-sm font-medium">{selectedLocation.address}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("dashboard.addTour.location.meetingPointHint")}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("dashboard.addTour.location.loadingMap")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
