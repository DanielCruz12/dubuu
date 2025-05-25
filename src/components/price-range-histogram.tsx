"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PriceRangeSliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function PriceRangeHistogram({
  value,
  onValueChange,
  min = 0,
  max = 1000,
  step = 10,
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const updateValue = useCallback(
    (clientX: number) => {
      if (isDragging === null || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const newValue =
        Math.round((percentage * (max - min) + min) / step) * step;

      const newRange: [number, number] = [...localValue];
      newRange[isDragging] = Math.max(min, Math.min(max, newValue));

      // Asegurar que min <= max
      if (isDragging === 0 && newRange[0] > newRange[1]) {
        newRange[1] = newRange[0];
      }
      if (isDragging === 1 && newRange[1] < newRange[0]) {
        newRange[0] = newRange[1];
      }

      setLocalValue(newRange);
      onValueChange(newRange);
    },
    [isDragging, localValue, max, min, step, onValueChange]
  );

  const handleMouseDown = useCallback((handleIndex: number) => {
    setIsDragging(handleIndex);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      updateValue(e.clientX);
    },
    [updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Touch events para móvil
  const handleTouchStart = useCallback((handleIndex: number) => {
    setIsDragging(handleIndex);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        updateValue(e.touches[0].clientX);
      }
    },
    [updateValue]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging !== null) {
      // Mouse events
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Touch events
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const minPosition = (localValue[0] / max) * 100;
  const maxPosition = (localValue[1] / max) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-1">Rango de precios</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Precio del viaje, incluye todas las tarifas
        </p>
      </div>

      {/* Slider */}
      <div className="relative px-3">
        <div
          ref={sliderRef}
          className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer touch-none"
        >
          {/* Track activo */}
          <div
            className="absolute h-3 bg-gray-900 dark:bg-gray-100 rounded-full"
            style={{
              left: `${minPosition}%`,
              width: `${maxPosition - minPosition}%`,
            }}
          />

          {/* Handle mínimo */}
          <div
            className="absolute w-7 h-7 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-transform touch-none"
            style={{ left: `${minPosition}%` }}
            onMouseDown={() => handleMouseDown(0)}
            onTouchStart={() => handleTouchStart(0)}
          />

          {/* Handle máximo */}
          <div
            className="absolute w-7 h-7 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-transform touch-none"
            style={{ left: `${maxPosition}%` }}
            onMouseDown={() => handleMouseDown(1)}
            onTouchStart={() => handleTouchStart(1)}
          />
        </div>

        {/* Labels de valores */}
        <div className="flex justify-between mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>${localValue[0]}</span>
          <span>${localValue[1] >= max ? `${max}+` : localValue[1]}</span>
        </div>
      </div>
    </div>
  );
}
