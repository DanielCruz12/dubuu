"use client";
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function TourCardSkeleton() {
  return (
    <div className="relative aspect-[16/10] rounded-lg">
      <Card className="overflow-hidden rounded-3xl border-0 shadow-lg">
        {/* Imagen y elementos superiores */}
        <div className="relative">
          {/* Placeholder de imagen */}
          <div className="w-full h-36 md:h-52 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          {/* Placeholder para el botón de favorito (Heart) */}
          <div className="absolute right-4 top-4 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          {/* Placeholder para la etiqueta de categoría */}
          <div className="absolute bottom-[-6px] left-4 rounded-full px-3 py-1.5 bg-gray-200 dark:bg-gray-700 animate-pulse">
            <div className="h-4 w-20" />
          </div>
        </div>

        {/* Contenido de la card */}
        <CardContent className="pt-3">
          {/* Placeholder para las estrellas y rating */}
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            ))}
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </div>
          {/* Placeholder para el título */}
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2" />
          {/* Placeholder para la descripción */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </div>
          {/* Placeholder para la duración */}
          <div className="mt-2 h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </CardContent>

        {/* Pie de la card */}
        <CardFooter className="flex items-center justify-between">
          <div>
            {/* Placeholder para el precio */}
            <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            {/* Placeholder para el texto de max_people */}
            <div className="mt-1 h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </div>
          {/* Placeholder para el botón "Book Now" */}
          <div className="rounded-full">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
