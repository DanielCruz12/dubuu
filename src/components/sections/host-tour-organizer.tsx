"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, MapPin, User } from "lucide-react";
import type { HostProfileDetailKey, HostPublicProfile } from "@/types/host-profile";
import { fetchHostPublicProfile } from "@/lib/host-profile-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function detailIcon(key: HostProfileDetailKey) {
  switch (key) {
    case "specialty":
      return MapPin;
    case "experience_types":
      return Link2;
    case "style":
      return User;
    default:
      return MapPin;
  }
}

function displayName(profile: HostPublicProfile) {
  const full = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
  if (full) return full;
  const u = profile.username?.trim();
  if (u) return u.charAt(0).toUpperCase() + u.slice(1);
  return "Anfitrión";
}

function initials(profile: HostPublicProfile) {
  const f = profile.firstName?.trim()?.charAt(0);
  const l = profile.lastName?.trim()?.charAt(0);
  if (f && l) return `${f}${l}`.toUpperCase();
  const u = profile.username?.trim() ?? "";
  if (u.length >= 2) return u.slice(0, 2).toUpperCase();
  if (u.length === 1) return `${u}`.toUpperCase();
  const id = profile.userId?.replace(/^user_/, "") ?? "";
  if (id.length >= 2) return id.slice(0, 2).toUpperCase();
  return "?";
}

function OrganizerSkeleton() {
  return (
    <div className="mt-12 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-28" />
              <div className="flex flex-wrap gap-4 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface HostTourOrganizerProps {
  hostUserId: string;
  /** Si la API falla, se muestra este nombre como respaldo. */
  fallbackUsername?: string;
  /** URL de foto si el perfil público no trae `imageUrl` (p. ej. usuario embebido en el producto). */
  fallbackImageUrl?: string;
}

export default function HostTourOrganizer({
  hostUserId,
  fallbackUsername,
  fallbackImageUrl,
}: HostTourOrganizerProps) {
  const [profile, setProfile] = useState<HostPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHostPublicProfile(hostUserId);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (e) {
        if (!cancelled) {
          setProfile(null);
          setError(e instanceof Error ? e.message : "Error al cargar el perfil");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hostUserId]);

  const statsLine = useMemo(() => {
    if (!profile) return null;
    const parts: string[] = [];
    const tourWord = profile.totalTours === 1 ? "tour" : "tours";
    parts.push(`${profile.totalTours} ${tourWord}`);
    parts.push(`${profile.anosExperiencia} años de experiencia`);
    return parts.join(" · ");
  }, [profile]);

  if (loading) {
    return <OrganizerSkeleton />;
  }

  if (error || !profile) {
    const fb = fallbackUsername?.trim();
    return (
      <div className="mt-12 space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          Quién organiza este tour
        </h2>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
          <p className="font-medium text-destructive">No se pudo cargar el perfil</p>
          <p className="text-muted-foreground mt-1">{error}</p>
          {fb ? (
            <p className="mt-3 text-muted-foreground">
              Usuario: <span className="font-medium text-foreground">{fb}</span>
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const name = displayName(profile);
  const avatarSrc =
    profile.imageUrl?.trim() || fallbackImageUrl?.trim() || null;

  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-xl md:text-2xl font-semibold">
        Quién organiza este tour
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
              <Avatar className="h-24 w-24 border-0">
                {avatarSrc ? (
                  <AvatarImage src={avatarSrc} alt={name} />
                ) : null}
                <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                  {initials(profile)}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-card bg-green-500"
                title="En línea"
                aria-hidden
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate">{name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Operador turístico
                </span>
              </div>
              <p className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                {statsLine}
              </p>
            </div>
          </div>

          {profile.intro ? (
            <p className="text-sm text-muted-foreground">{profile.intro}</p>
          ) : null}

          <ul className="space-y-3">
            {(profile.detalles ?? []).map((item) => {
              const Icon = detailIcon(item.key);
              const label =
                item.label.endsWith(":") || item.label.endsWith("：")
                  ? item.label
                  : `${item.label}:`;
              return (
                <li key={item.key} className="flex gap-3 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">
                    <span className="font-normal">{label} </span>
                    <span className="font-semibold text-foreground">
                      {item.value}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Información del operador</h4>
            <p className="text-sm text-muted-foreground">
              {profile.descripcion || "—"}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Tipos de experiencia</h4>
            <div className="flex flex-wrap gap-2">
              {profile.tiposExperiencia?.length ? (
                profile.tiposExperiencia.map((tipo) => (
                  <Badge
                    key={tipo}
                    variant="secondary"
                    className="text-xs font-normal py-1 px-2 rounded-md"
                  >
                    {tipo}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Idiomas</h4>
            <div className="flex flex-wrap gap-2">
              {profile.idiomas?.length ? (
                profile.idiomas.map((idioma) => (
                  <Badge
                    key={idioma}
                    variant="secondary"
                    className="text-xs font-normal py-1 px-2 rounded-md"
                  >
                    {idioma}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
