"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  interactive?: boolean;
  size?: "small" | "default" | "large";
  onChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  value,
  interactive = false,
  size = "default",
  onChange,
  className = "",
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  // Tamaños mejorados para las estrellas
  const starSizeClasses = {
    small: "w-3.5 h-3.5",
    default: "w-5 h-5",
    large: "w-7 h-7 sm:w-8 sm:h-8",
  };

  // Clases para el contenedor
  const containerClasses = `flex ${interactive ? "gap-1.5" : "gap-1"} ${className}`;

  return (
    <div className={containerClasses}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const filled = interactive
          ? (hoveredRating || value) >= starValue
          : value >= starValue;

        // Determinar si es una estrella parcial (solo para no interactivas)
        const isPartial =
          !interactive && value > starValue - 1 && value < starValue;

        return (
          <div
            key={starValue}
            className="relative"
            onClick={interactive ? () => onChange?.(starValue) : undefined}
            onMouseEnter={
              interactive ? () => setHoveredRating(starValue) : undefined
            }
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          >
            {/* Estrella base (contorno) */}
            <Star
              className={`${starSizeClasses[size]} 
                ${interactive ? "cursor-pointer transform transition-transform duration-200 hover:scale-110" : ""} 
                ${filled ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}
                transition-colors duration-200`}
              strokeWidth={1.5}
            />

            {/* Relleno de la estrella */}
            {(filled || isPartial) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: isPartial
                    ? `${(value - (starValue - 1)) * 100}%`
                    : "100%",
                }}
              >
                <Star
                  className={`${starSizeClasses[size]} fill-amber-400 text-amber-400`}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
