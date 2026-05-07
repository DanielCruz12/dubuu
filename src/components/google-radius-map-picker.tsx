"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
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

/** Advanced markers requieren un Map ID en Google Cloud. Sin esto, usamos Marker clásico + icono canvas. */
const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;
const USE_ADVANCED_MARKERS = Boolean(GOOGLE_MAP_ID);

function geocodeCacheKey(lat: number, lng: number): string {
  const r = 10000;
  return `${Math.round(lat * r) / r},${Math.round(lng * r) / r}`;
}

export interface RadiusLocationSelection {
  lat: number;
  lng: number;
  address: string;
}

interface GoogleRadiusMapPickerProps {
  onLocationSelect: (location: RadiusLocationSelection) => void;
  selectedLocation: RadiusLocationSelection | null;
  apiKey: string;
  radiusKm: number;
}

function createCustomMarkerContent(): HTMLDivElement {
  const size = 56;
  const iconPx = 38;

  const wrapper = document.createElement("div");
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.borderRadius = "9999px";
  wrapper.style.background = "#ffffff";
  wrapper.style.border = "1px solid #e4e4e7";
  wrapper.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.12)";

  const img = document.createElement("img");
  img.src = "/icon.png";
  img.alt = "Dubuu marker";
  img.style.width = `${iconPx}px`;
  img.style.height = `${iconPx}px`;
  img.style.objectFit = "contain";

  wrapper.appendChild(img);
  return wrapper;
}

/** Icono con círculo de fondo para Marker clásico (no requiere Map ID). */
function createCircleMarkerIcon(maps: typeof google.maps): Promise<google.maps.Icon> {
  return new Promise((resolve) => {
    const size = 56;
    const iconDraw = 38;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const fallbackIcon = (): google.maps.Icon => ({
      url: "/icon.png",
      scaledSize: new maps.Size(size, size),
      anchor: new maps.Point(size / 2, size / 2),
    });

    if (!ctx) {
      resolve(fallbackIcon());
      return;
    }

    const r = size / 2 - 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 1;
    ctx.stroke();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const iw = iconDraw;
      ctx.drawImage(img, (size - iw) / 2, (size - iw) / 2, iw, iw);
      resolve({
        url: canvas.toDataURL("image/png"),
        scaledSize: new maps.Size(size, size),
        anchor: new maps.Point(size / 2, size / 2),
      });
    };
    img.onerror = () => resolve(fallbackIcon());
    img.src = "/icon.png";
  });
}

function clearMarker(
  markerRef: MutableRefObject<google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null>,
) {
  const m = markerRef.current;
  if (!m) return;
  if ("setMap" in m && typeof m.setMap === "function") {
    m.setMap(null);
  } else {
    (m as google.maps.marker.AdvancedMarkerElement).map = null;
  }
  markerRef.current = null;
}

function stylePlaceAutocompleteElement(el: HTMLElement) {
  el.style.width = "100%";
  el.style.display = "block";
  el.style.setProperty("color-scheme", "light");
  el.style.setProperty("--gmp-mat-color-surface", "#f4f4f5");
  el.style.setProperty("--gmp-mat-color-on-surface", "#18181b");
  el.style.setProperty("--gmp-mat-color-on-surface-variant", "#71717a");
  el.style.setProperty("--gmp-mat-color-outline", "#d4d4d8");
}

export function GoogleRadiusMapPicker({
  onLocationSelect,
  selectedLocation,
  apiKey,
  radiusKm,
}: GoogleRadiusMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | google.maps.marker.AdvancedMarkerElement | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const classicMarkerIconPromiseRef = useRef<Promise<google.maps.Icon> | null>(null);
  const placeAutocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapTypeId>("roadmap");
  const geocodeCacheRef = useRef<Map<string, string>>(new Map());
  const clickDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const fitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Init map
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

        let AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | null = null;
        if (USE_ADVANCED_MARKERS) {
          const markerLib = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;
          AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
        }

        const center = selectedLocation
          ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
          : DEFAULT_CENTER;

        const mapOptions: google.maps.MapOptions = {
          center,
          zoom: selectedLocation ? 16 : 13,
          zoomControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
        };
        if (USE_ADVANCED_MARKERS && GOOGLE_MAP_ID) {
          mapOptions.mapId = GOOGLE_MAP_ID;
        }

        const map = new google.maps.Map(mapContainerRef.current, mapOptions);
        mapRef.current = map;
        map.setMapTypeId(mapType);

        const getClassicIcon = () => {
          if (!classicMarkerIconPromiseRef.current) {
            classicMarkerIconPromiseRef.current = createCircleMarkerIcon(google.maps);
          }
          return classicMarkerIconPromiseRef.current;
        };

        const ensureCircle = (lat: number, lng: number) => {
          const meters = Math.max(0, radiusKm) * 1000;
          if (!circleRef.current) {
            circleRef.current = new google.maps.Circle({
              map,
              center: { lat, lng },
              radius: meters,
              strokeColor: "#2563eb",
              strokeOpacity: 0.85,
              strokeWeight: 2,
              fillColor: "#3b82f6",
              fillOpacity: 0.18,
              clickable: false,
            });
          } else {
            circleRef.current.setCenter({ lat, lng });
            circleRef.current.setRadius(meters);
            circleRef.current.setMap(map);
          }

          // Keep the circle visible (zoom out enough to show radius).
          const bounds = circleRef.current.getBounds();
          if (bounds) {
            map.fitBounds(bounds, { top: 90, right: 90, bottom: 90, left: 90 });
            const z = map.getZoom();
            if (z != null && z > 14) map.setZoom(14);
          }
        };

        const addMarker = (lat: number, lng: number) => {
          clearMarker(markerRef);

          if (USE_ADVANCED_MARKERS && AdvancedMarkerElement) {
            markerRef.current = new AdvancedMarkerElement({
              map,
              position: { lat, lng },
              title: t("dashboard.addTour.location.meetingPointTitle"),
              content: createCustomMarkerContent(),
            });
          } else {
            void getClassicIcon().then((icon) => {
              markerRef.current = new google.maps.Marker({
                map,
                position: { lat, lng },
                title: t("dashboard.addTour.location.meetingPointTitle"),
                icon,
              });
            });
          }

          ensureCircle(lat, lng);
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
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
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
          });
        };

        clickListenerRef.current = map.addListener("click", (e: google.maps.MapMouseEvent) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat == null || lng == null) return;
          addMarker(lat, lng);
          if (clickDebounceRef.current != null) clearTimeout(clickDebounceRef.current);
          clickDebounceRef.current = setTimeout(() => {
            clickDebounceRef.current = null;
            resolveAddress(lat, lng, (address) => onLocationSelect({ lat, lng, address }));
          }, MAP_CLICK_DEBOUNCE_MS);
        });

        // Place autocomplete
        if (containerRef) {
          const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
            locationBias: map.getBounds() ?? undefined,
          });
          placeAutocomplete.id = "place-autocomplete-input";
          containerRef.innerHTML = "";
          containerRef.appendChild(placeAutocomplete);
          stylePlaceAutocompleteElement(placeAutocomplete);
          placeAutocompleteRef.current = placeAutocomplete;

          const handlePlaceSelect = async (ev: Event) => {
            const payload =
              (ev as CustomEvent<{
                placePrediction?: { toPlace: () => google.maps.places.Place | Promise<google.maps.places.Place> };
              }>).detail ??
              (ev as {
                placePrediction?: { toPlace: () => google.maps.places.Place | Promise<google.maps.places.Place> };
              });
            const placePrediction = payload.placePrediction;
            if (!placePrediction?.toPlace) return;
            const place = await Promise.resolve(placePrediction.toPlace());
            await place.fetchFields({ fields: ["displayName", "formattedAddress", "location"] });
            const loc = place.location;
            if (!loc) return;
            const lat =
              typeof (loc as google.maps.LatLng).lat === "function"
                ? (loc as google.maps.LatLng).lat()
                : (loc as unknown as { lat: number }).lat;
            const lng =
              typeof (loc as google.maps.LatLng).lng === "function"
                ? (loc as google.maps.LatLng).lng()
                : (loc as unknown as { lng: number }).lng;
            const addr = place as { formattedAddress?: string; displayName?: string };
            const address =
              addr.formattedAddress ?? addr.displayName ?? t("dashboard.addTour.location.addressNotFound");
            addMarker(lat, lng);
            onLocationSelect({ lat, lng, address });
            map.setCenter({ lat, lng });
            map.setZoom(16);
          };
          placeAutocomplete.addEventListener("gmp-select", handlePlaceSelect);
        }

        // Initial marker/circle
        if (selectedLocation) {
          addMarker(selectedLocation.lat, selectedLocation.lng);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              map.setCenter({ lat, lng });
              map.setZoom(13);
              ensureCircle(lat, lng);
            },
            () => {},
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
      if (fitDebounceRef.current != null) clearTimeout(fitDebounceRef.current);
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
      clearMarker(markerRef);
      circleRef.current?.setMap(null);
      circleRef.current = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [apiKey, onLocationSelect, t]);

  // Sync marker/circle when selection changes externally
  useEffect(() => {
    if (!mapRef.current || !selectedLocation || typeof window === "undefined" || !window.google?.maps) return;
    const map = mapRef.current;
    const lat = selectedLocation.lat;
    const lng = selectedLocation.lng;
    map.setCenter({ lat, lng });
    map.setZoom(16);

    // Keep circle in sync
    const meters = Math.max(0, radiusKm) * 1000;
    if (!circleRef.current) {
      circleRef.current = new window.google.maps.Circle({
        map,
        center: { lat, lng },
        radius: meters,
        strokeColor: "#2563eb",
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.18,
        clickable: false,
      });
    } else {
      circleRef.current.setMap(map);
      circleRef.current.setCenter({ lat, lng });
      circleRef.current.setRadius(meters);
    }

    const bounds = circleRef.current.getBounds();
    if (bounds) {
      map.fitBounds(bounds, { top: 90, right: 90, bottom: 90, left: 90 });
      const z = map.getZoom();
      if (z != null && z > 14) map.setZoom(14);
    }
  }, [selectedLocation, radiusKm]);

  // Sync radius only
  useEffect(() => {
    if (!circleRef.current || !mapRef.current) return;
    const meters = Math.max(0, radiusKm) * 1000;
    circleRef.current.setRadius(meters);
    if (fitDebounceRef.current != null) clearTimeout(fitDebounceRef.current);
    fitDebounceRef.current = setTimeout(() => {
      const map = mapRef.current;
      const c = circleRef.current;
      if (!map || !c) return;
      const bounds = c.getBounds();
      if (!bounds) return;
      map.fitBounds(bounds, { top: 90, right: 90, bottom: 90, left: 90 });
      const z = map.getZoom();
      if (z != null && z > 14) map.setZoom(14);
    }, 120);
  }, [radiusKm]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation || typeof window === "undefined" || !window.google?.maps) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const map = mapRef.current;
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(16);
        }
        const cache = geocodeCacheRef.current;
        const key = geocodeCacheKey(lat, lng);
        const cached = cache.get(key);
        if (cached !== undefined) {
          onLocationSelect({ lat, lng, address: cached });
          return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          const address =
            status === window.google.maps.GeocoderStatus.OK && results?.[0]
              ? results[0].formatted_address
              : t("dashboard.addTour.location.addressNotFound");
          if (cache.size >= GEOCODE_CACHE_MAX) {
            const firstKey = cache.keys().next().value;
            if (firstKey !== undefined) cache.delete(firstKey);
          }
          cache.set(key, address);
          onLocationSelect({ lat, lng, address });
        });
      },
      () => {},
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
      <div className="absolute left-2 right-2 top-2 z-[1000] flex flex-col gap-2">
        <div
          ref={autocompleteContainerRef}
          className="min-h-10 w-full [&_gmp-place-autocomplete]:block [&_gmp-place-autocomplete]:w-full"
        />
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
              <SelectTrigger
                className="h-9 min-w-0 flex-1 bg-background/95 shadow-md backdrop-blur [&>span]:truncate"
                aria-label={t("dashboard.addTour.location.mapTypeLabel")}
              >
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

      <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: 500 }} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("dashboard.addTour.location.loadingMap")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

