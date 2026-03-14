/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@clerk/nextjs";
import { DashboardTitle } from "@/components/dashboard-title";
import { FavoritedTourCard } from "@/components/favorited-tour-card";
import { useLanguage } from "@/lib/i18n-context";
import { Loader2, Heart } from "lucide-react";
import Link from "next/link";
import { useGetUserFavoritesQuery } from "@/redux/slices/favorite/favorite-slice";

interface SavedProductsProps {
  heading?: string;
  description?: string;
  emptyStateMessage?: string;
  exploreLink?: string;
  exploreLinkText?: string;
  className?: string;
}

export const SavedProducts = ({
  heading,
  description,
  emptyStateMessage,
  exploreLink = "/home",
  exploreLinkText,
  className = "px-3 md:px-0",
}: SavedProductsProps) => {
  const { t } = useLanguage();
  const { user, isSignedIn, isLoaded } = useUser();
  const {
    data: favorites,
    isLoading,
    error,
  } = useGetUserFavoritesQuery(
    { userId: user?.id || "" },
    { skip: !isSignedIn || !user?.id }
  );

  const headingText = heading ?? t("dashboard.saved.heading");
  const descriptionText = description ?? t("dashboard.saved.description");
  const emptyText = emptyStateMessage ?? t("dashboard.saved.emptyStateMessage");
  const exploreText = exploreLinkText ?? t("dashboard.saved.exploreLinkText");

  if (!isLoaded) {
    return (
      <div className={className}>
        <DashboardTitle heading={headingText} description={descriptionText} />
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={className}>
        <DashboardTitle heading={headingText} description={descriptionText} />
        <div className="mt-8 text-center">
          <p>{t("dashboard.saved.signInMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DashboardTitle heading={headingText} description={descriptionText} />

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="mt-8 text-center">
          <p className="text-red-500">{t("dashboard.saved.loadError")}</p>
        </div>
      )}

      {favorites && favorites.length === 0 && (
        <div className="mt-8 text-center">
          <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">{emptyText}</p>
          <Link
            href={exploreLink}
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            {exploreText}
          </Link>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite: any) => (
            <FavoritedTourCard
              key={favorite.id}
              productId={favorite.product_id || favorite.productId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
