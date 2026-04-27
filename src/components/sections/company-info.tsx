"use client";

import type { IProduct } from "@/types/product";
import HostTourOrganizer from "@/components/sections/host-tour-organizer";
import { useLanguage } from "@/lib/i18n-context";

function getProductUser(product: IProduct) {
  const u = product?.user;
  if (!u) return null;
  return Array.isArray(u) ? u[0] : u;
}

function hostImageFromProductUser(
  u: { id: string; username: string; email?: string } & Record<string, unknown>,
): string | undefined {
  for (const key of [
    "image_url",
    "imageUrl",
    "profile_image",
    "profile_image_url",
    "avatar_url",
    "photo_url",
  ] as const) {
    const v = u[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

interface CompanyInfoProps {
  product: IProduct | null | undefined;
}

export default function CompanyInfo({ product }: CompanyInfoProps) {
  const { t } = useLanguage();
  const user = product ? getProductUser(product) : null;

  if (!product) return null;

  if (!user) {
    return (
      <div className="mt-4">
        <h2 className="text-base md:text-xl font-semibold py-3 mb-4">
          {t("home.organizer.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("home.organizer.noHostInfo")}
        </p>
      </div>
    );
  }

  return (
    <HostTourOrganizer
      hostUserId={user.id}
      fallbackUsername={user.username}
      fallbackImageUrl={hostImageFromProductUser(
        user as { id: string; username: string; email?: string } & Record<
          string,
          unknown
        >,
      )}
    />
  );
}
