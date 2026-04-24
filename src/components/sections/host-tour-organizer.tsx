"use client";

import { useMemo } from "react";
import { Link2, MapPin, User } from "lucide-react";
import type { HostProfileDetailKey, HostPublicProfile } from "@/types/host-profile";
import { useGetHostPublicProfileQuery } from "@/redux/slices/host/host-profile-slice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";

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
  return "—";
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
  const { t } = useLanguage();
  const {
    data: profile,
    isLoading: loading,
    error,
  } = useGetHostPublicProfileQuery(
    { userId: hostUserId },
    { skip: !hostUserId },
  );

  const statsLine = useMemo(() => {
    if (!profile) return null;
    const parts: string[] = [];

    const toursKey =
      profile.totalTours === 1
        ? "home.organizer.stats.tours_one"
        : "home.organizer.stats.tours_other";
    parts.push(t(toursKey).replace("{count}", String(profile.totalTours)));

    const yearsKey =
      profile.anosExperiencia === 1
        ? "home.organizer.stats.years_one"
        : "home.organizer.stats.years_other";
    parts.push(t(yearsKey).replace("{count}", String(profile.anosExperiencia)));

    return parts.join(" · ");
  }, [profile, t]);

  if (loading) {
    return <OrganizerSkeleton />;
  }

  if (error || !profile) {
    const fb = fallbackUsername?.trim();
    const message =
      error && typeof error === "object" && "data" in error
        ? String((error as { data?: unknown }).data ?? "")
        : error && typeof error === "object" && "error" in error
          ? String((error as { error?: unknown }).error ?? "")
          : "";
    return (
      <div className="mt-12 space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">
          {t("home.organizer.title")}
        </h2>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
          <p className="font-medium text-destructive">
            {t("home.organizer.loadErrorTitle")}
          </p>
          <p className="text-muted-foreground mt-1">
            {message || t("home.organizer.loadErrorTitle")}
          </p>
          {fb ? (
            <p className="mt-3 text-muted-foreground">
              {t("home.organizer.loadErrorFallbackUser")}{" "}
              <span className="font-medium text-foreground">{fb}</span>
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
        {t("home.organizer.title")}
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
                title={t("home.organizer.online")}
                aria-hidden
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold truncate">{name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {t("home.organizer.roleBadge")}
                </span>
              </div>
              <p className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                {statsLine}
              </p>
            </div>
          </div>

          {profile.intro ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {profile.intro}
            </p>
          ) : null}

          <ul className="space-y-3">
            {(profile.detalles ?? []).map((item) => {
              const Icon = detailIcon(item.key);
              const keyLabel = t(`home.organizer.details.${item.key}`);
              const label =
                keyLabel.endsWith(":") || keyLabel.endsWith("：")
                  ? keyLabel
                  : `${keyLabel}:`;
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
            <h4 className="font-semibold mb-2">
              {t("home.organizer.operatorInfoTitle")}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {profile.descripcion || t("home.organizer.emptyValue")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">
              {t("home.organizer.experienceTypesTitle")}
            </h4>
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
                <span className="text-sm text-muted-foreground">
                  {t("home.organizer.emptyValue")}
                </span>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">
              {t("home.organizer.languagesTitle")}
            </h4>
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
                <span className="text-sm text-muted-foreground">
                  {t("home.organizer.emptyValue")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
