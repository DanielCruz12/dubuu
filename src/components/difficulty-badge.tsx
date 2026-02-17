"use client";

import { Mountain, MountainSnow, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

type DifficultyLevel =
  | "fácil"
  | "moderado"
  | "difícil"
  | "extremo"
  | "easy"
  | "medium"
  | "hard"
  | "extreme"
  | string;

interface TourDifficultyBadgeProps {
  difficulty: DifficultyLevel;
  className?: string;
}

export function TourDifficultyBadge({
  difficulty,
  className,
}: TourDifficultyBadgeProps) {
  const { t } = useLanguage();
  const difficultyMap: Record<string, string> = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
    extreme: "extreme",
    facil: "easy",
    moderado: "medium",
    dificil: "hard",
    extremo: "extreme",
  };

  const normalizedInput =
    difficulty
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "easy";

  const mapKey = difficultyMap[normalizedInput] || "easy";

  const normalizedDifficulty = (difficulty ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const config = {
    facil: {
      icon: Footprints,
      bgColor: "from-green-500 to-green-600",
      textColor: "text-white",
      label: t("home.difficulty.easy"),
    },
    moderado: {
      icon: Mountain,
      bgColor: "from-yellow-500 to-yellow-600",
      textColor: "text-white",
      label: t("home.difficulty.medium"),
    },
    dificil: {
      icon: Mountain,
      bgColor: "from-orange-500 to-orange-600",
      textColor: "text-white",
      label: t("home.difficulty.hard"),
    },
    extremo: {
      icon: MountainSnow,
      bgColor: "from-red-500 to-red-700",
      textColor: "text-white",
      label: t("home.difficulty.extreme"),
    },
  };

  // Determinar qué configuración usar basado en la dificultad normalizada
  let badgeConfig = config.facil;
  if (normalizedDifficulty.includes("facil") || mapKey === "easy") {
    badgeConfig = config.facil;
  } else if (
    normalizedDifficulty.includes("moderado") ||
    normalizedDifficulty.includes("medio") ||
    mapKey === "medium"
  ) {
    badgeConfig = config.moderado;
  } else if (normalizedDifficulty.includes("dificil") || mapKey === "hard") {
    badgeConfig = config.dificil;
  } else if (
    normalizedDifficulty.includes("extremo") ||
    normalizedDifficulty.includes("avanzado") ||
    mapKey === "extreme"
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
      <span>{badgeConfig.label}</span>
      <span className="sr-only">{t("home.difficulty.sr")}</span>
    </div>
  );
}
