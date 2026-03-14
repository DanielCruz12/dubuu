/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useGetProductQuery } from "@/redux/slices/product/product-slice";
import { TourCard } from "@/components/tour-card";
import { useLanguage } from "@/lib/i18n-context";

interface FavoritedTourCardProps {
  productId: string;
}

export function FavoritedTourCard({ productId }: FavoritedTourCardProps) {
  const { t } = useLanguage();
  const { data: product, isLoading, error } = useGetProductQuery(productId);

  // Loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-xl border-none shadow-lg">
        <div className="aspect-[16/10] rounded-t-lg bg-gray-200 animate-pulse"></div>
        <CardContent className="pt-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded-full animate-pulse w-1/3"></div>
        </CardFooter>
      </Card>
    );
  }

  if (error || !product) {
    return (
      <Card className="overflow-hidden rounded-xl border-none shadow-lg">
        <div className="aspect-[16/10] rounded-t-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("dashboard.saved.cardLoadError")}</p>
        </div>
        <CardContent className="pt-3">
          <p className="text-red-500">{t("dashboard.saved.cardLoadErrorDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  // Success state - render TourCard with product data
  return <TourCard {...product} />;
}
