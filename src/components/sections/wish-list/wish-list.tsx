/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@clerk/nextjs";
import { DashboardTitle } from "@/components/dashboard-title";
import { FavoritedTourCard } from "@/components/favorited-tour-card";

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
  heading = "Guardados",
  description = "Vuelve a ver los productos que guardaste anteriormente",
  emptyStateMessage = "No tienes productos guardados",
  exploreLink = "/home",
  exploreLinkText = "Explorar productos",
  className = "px-3 md:px-0",
}: SavedProductsProps) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const {
    data: favorites,
    isLoading,
    error,
  } = useGetUserFavoritesQuery(
    { userId: user?.id || "" },
    { skip: !isSignedIn || !user?.id }
  );

  // Wait for Clerk to load user data
  if (!isLoaded) {
    return (
      <div className={className}>
        <DashboardTitle heading={heading} description={description} />
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={className}>
        <DashboardTitle heading={heading} description={description} />
        <div className="mt-8 text-center">
          <p>Inicia sesión para ver tus productos guardados</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DashboardTitle heading={heading} description={description} />

      {isLoading && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="mt-8 text-center">
          <p className="text-red-500">
            Error al cargar tus productos guardados
          </p>
        </div>
      )}

      {favorites && favorites.length === 0 && (
        <div className="mt-8 text-center">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-300" />
          </div>
          <p className="mt-4 text-gray-500">{emptyStateMessage}</p>
          <Link
            href={exploreLink}
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            {exploreLinkText}
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
