"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Languages, Link2, MapPin, User } from "lucide-react";
import type { HostProfileDetailKey, HostPublicProfile } from "@/types/host-profile";
import { useGetHostPublicProfileQuery } from "@/redux/slices/host/host-profile-slice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n-context";
import { ExpandableContent } from "@/components/ui/expandable-content";

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
    <div className="mt-4 space-y-4">
      <Skeleton className="h-7 w-56 max-w-full sm:w-64" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-row items-start gap-3 sm:gap-4">
            <Skeleton className="h-[5.25rem] w-[5.25rem] shrink-0 rounded-full sm:h-24 sm:w-24" />
            <div className="flex min-w-0 flex-1 flex-col space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-3.5 w-48" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="border-t border-border/60 pt-3">
            <ul className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex min-w-0 items-center gap-2.5">
                  <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                  <Skeleton className="h-4 min-w-0 flex-1 max-w-full" />
                </li>
              ))}
              <li className="flex min-w-0 items-center gap-2.5 lg:hidden">
                <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                <Skeleton className="h-4 min-w-0 flex-1 max-w-full" />
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-xl border bg-card p-4 shadow-sm lg:gap-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
          <div className="hidden space-y-2 lg:block">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-md" />
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
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mt-4 space-y-4"
      >
        <h2 className="text-base md:text-lg font-semibold py-3">
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
      </motion.div>
    );
  }

  const name = displayName(profile);
  const avatarSrc =
    profile.imageUrl?.trim() || fallbackImageUrl?.trim() || null;
  const languagesTitleRaw = t("home.organizer.languagesTitle");
  const languagesLabel =
    languagesTitleRaw.endsWith(":") || languagesTitleRaw.endsWith("：")
      ? languagesTitleRaw
      : `${languagesTitleRaw}:`;
  const idiomasJoined =
    profile.idiomas?.length ? profile.idiomas.join(", ") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mt-4 space-y-4"
    >
      <h2 className="text-left text-base md:text-lg font-semibold py-3">
        {t("home.organizer.title")}
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex w-full flex-row items-start gap-3 sm:gap-4">
            <div className="relative h-[5.25rem] w-[5.25rem] sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-border/60 shadow-sm">
              <Avatar className="h-full w-full border-0">
                {avatarSrc ? (
                  <AvatarImage src={avatarSrc} alt={name} />
                ) : null}
                <AvatarFallback className="bg-muted text-muted-foreground text-xl sm:text-2xl">
                  {initials(profile)}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 sm:bottom-1 sm:right-1 sm:h-3 sm:w-3 rounded-full border-2 border-card bg-emerald-500"
                title={t("home.organizer.online")}
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2 text-left">
              <div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight text-foreground">
                  {name}
                </h3>
                <span className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {t("home.organizer.roleBadge")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                {statsLine}
              </p>
            </div>
          </div>

          {profile.intro ? (
            <ExpandableContent
              length={profile.intro.length}
              clampClass="line-clamp-2"
            >
              <p className="text-left text-sm text-muted-foreground">
                {profile.intro}
              </p>
            </ExpandableContent>
          ) : null}

          {(profile.detalles?.length ?? 0) > 0 ||
          (profile.idiomas && profile.idiomas.length > 0) ? (
            <div className="border-t border-border/60 pt-3 sm:pt-4">
              <ul className="space-y-2.5 sm:space-y-3">
                {(profile.detalles ?? []).map((item) => {
                  const Icon = detailIcon(item.key);
                  const keyLabel = t(`home.organizer.details.${item.key}`);
                  const label =
                    keyLabel.endsWith(":") || keyLabel.endsWith("：")
                      ? keyLabel
                      : `${keyLabel}:`;
                  return (
                    <li
                      key={item.key}
                      className="flex min-w-0 items-center gap-2.5 text-sm"
                    >
                      <Icon
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1 leading-snug line-clamp-1">
                        <span className="text-muted-foreground font-normal">
                          {label}
                        </span>
                        <span className="text-foreground font-medium">
                          {" "}
                          {item.value}
                        </span>
                      </div>
                    </li>
                  );
                })}
                {profile.idiomas && profile.idiomas.length > 0 ? (
                  <li className="flex min-w-0 items-center gap-2.5 text-sm lg:hidden">
                    <Languages
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <div
                      className="min-w-0 flex-1 leading-snug line-clamp-1"
                      title={idiomasJoined}
                    >
                      <span className="text-muted-foreground font-normal">
                        {languagesLabel}
                      </span>
                      <span className="text-foreground font-medium">
                        {" "}
                        {idiomasJoined}
                      </span>
                    </div>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-5 rounded-xl border bg-card p-4 shadow-sm lg:gap-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold tracking-tight text-foreground lg:text-base mb-2">
              {t("home.organizer.operatorInfoTitle")}
            </h4>
            <ExpandableContent
              length={profile.descripcion?.length ?? 0}
              clampClass="line-clamp-2"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.descripcion || t("home.organizer.emptyValue")}
              </p>
            </ExpandableContent>
          </div>
          <div className="hidden min-w-0 border-t border-border/80 pt-5 lg:block lg:border-t-0 lg:pt-0">
            <h4 className="text-sm font-semibold tracking-tight text-foreground lg:text-base mb-2">
              {t("home.organizer.languagesTitle")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.idiomas?.length ? (
                profile.idiomas.map((idioma) => (
                  <Badge
                    key={idioma}
                    variant="secondary"
                    className="text-xs font-normal rounded-md py-1 px-2"
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
    </motion.div>
  );
}
