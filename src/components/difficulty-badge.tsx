"use client";

import { Mountain, MountainSnow, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

type DifficultyLevel = "fácil" | "moderado" | "difícil" | "extremo" | string;

interface TourDifficultyBadgeProps {
  difficulty: DifficultyLevel;
  className?: string;
}

export function TourDifficultyBadge({
  difficulty,
  className,
}: TourDifficultyBadgeProps) {
  // Normalizar la dificultad (convertir a minúsculas y quitar acentos)
  const normalizedDifficulty =
    difficulty
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "fácil";

  // Configuración según nivel de dificultad
  const config = {
    facil: {
      icon: Footprints,
      bgColor: "from-green-500 to-green-600",
      textColor: "text-white",
      label: "Fácil",
    },
    moderado: {
      icon: Mountain,
      bgColor: "from-yellow-500 to-yellow-600",
      textColor: "text-white",
      label: "Moderado",
    },
    dificil: {
      icon: Mountain,
      bgColor: "from-orange-500 to-orange-600",
      textColor: "text-white",
      label: "Difícil",
    },
    extremo: {
      icon: MountainSnow,
      bgColor: "from-red-500 to-red-700",
      textColor: "text-white",
      label: "Extremo",
    },
  };

  // Determinar qué configuración usar basado en la dificultad normalizada
  let badgeConfig = config.facil;

  if (normalizedDifficulty.includes("facil")) {
    badgeConfig = config.facil;
  } else if (
    normalizedDifficulty.includes("moderado") ||
    normalizedDifficulty.includes("medio")
  ) {
    badgeConfig = config.moderado;
  } else if (normalizedDifficulty.includes("dificil")) {
    badgeConfig = config.dificil;
  } else if (
    normalizedDifficulty.includes("extremo") ||
    normalizedDifficulty.includes("avanzado")
  ) {
    badgeConfig = config.extremo;
  }

  const Icon = badgeConfig.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-sm bg-gradient-to-r shadow-md",
        badgeConfig.bgColor,
        badgeConfig.textColor,
        "transition-all hover:shadow-lg hover:scale-105",
        className
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{difficulty || badgeConfig.label}</span>
      <span className="sr-only">Nivel de dificultad</span>
    </div>
  );
}
