"use client";

/**
 * Mapas del chat (solo cliente: importar con `next/dynamic` y `ssr: false`).
 * - `LocationPreview`: mini-mapa de lectura para mensajes de ubicación.
 * - `LocationPickerDialog`: diálogo para elegir un punto y enviarlo.
 */

import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n-context";

/** El Salvador por defecto (mismo centro que el resto de la app). */
const DEFAULT_CENTER: [number, number] = [13.8447, -89.6306];

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const PIN_STYLE = {
  color: "#e11d48",
  weight: 3,
  fillColor: "#e11d48",
  fillOpacity: 0.9,
};

function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

// ---------------------------------------------------------------------------
// Vista previa (lectura)
// ---------------------------------------------------------------------------

export function LocationPreview({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label?: string | null;
}) {
  const { t } = useLanguage();

  return (
    <span className="block w-56 max-w-full sm:w-64">
      {label ? (
        <span className="mb-1.5 block truncate text-sm font-medium">
          {label}
        </span>
      ) : null}
      <div
        role="button"
        tabIndex={0}
        aria-label={t("messaging.conversation.openInMaps")}
        className="block cursor-pointer overflow-hidden rounded-md"
        onClick={(e) => {
          // Dejar pasar los clics en la atribución del mapa.
          if ((e.target as HTMLElement).closest("a")) return;
          e.stopPropagation();
          window.open(mapsLink(lat, lng), "_blank", "noreferrer");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.open(mapsLink(lat, lng), "_blank", "noreferrer");
          }
        }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
          touchZoom={false}
          className="h-40 w-full"
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <CircleMarker center={[lat, lng]} radius={9} pathOptions={PIN_STYLE} />
        </MapContainer>
      </div>
      <a
        href={mapsLink(lat, lng)}
        target="_blank"
        rel="noreferrer"
        className="mt-1.5 inline-block text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {t("messaging.conversation.openInMaps")}
      </a>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Selector (diálogo)
// ---------------------------------------------------------------------------

function CenterTracker({
  onCenterChange,
}: {
  onCenterChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 0.8 });
  }, [map, target]);
  return null;
}

export function LocationPickerDialog({
  open,
  onOpenChange,
  onSend,
  sending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (lat: number, lng: number, label?: string) => void;
  sending: boolean;
}) {
  const { t } = useLanguage();
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [label, setLabel] = useState("");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setCenter(next);
        setFlyTo(next);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setGeoError(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("messaging.location.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("messaging.location.dialogHint")}
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-lg border">
          <MapContainer
            center={center}
            zoom={13}
            zoomControl={false}
            className="h-64 w-full"
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <CenterTracker
              onCenterChange={(lat, lng) => setCenter([lat, lng])}
            />
            <FlyTo target={flyTo} />
          </MapContainer>
          {/* Pin fijo al centro: se mueve el mapa, no el pin */}
          <span className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <MapPin className="h-8 w-8 fill-rose-600 text-white drop-shadow-md" />
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute bottom-3 right-3 z-[500]"
            onClick={useMyLocation}
            disabled={locating}
          >
            {locating ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="mr-1 h-4 w-4" />
            )}
            {locating
              ? t("messaging.location.locating")
              : t("messaging.location.myLocation")}
          </Button>
        </div>
        {geoError && (
          <p className="text-sm text-destructive">
            {t("messaging.location.error")}
          </p>
        )}

        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t("messaging.location.labelPlaceholder")}
          maxLength={200}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            {t("messaging.location.cancel")}
          </Button>
          <Button
            type="button"
            onClick={() =>
              onSend(center[0], center[1], label.trim() || undefined)
            }
            disabled={sending}
          >
            {sending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {t("messaging.location.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
