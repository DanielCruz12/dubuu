"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

interface ExpandableContentProps {
  children: ReactNode;
  /** Longitud del contenido en caracteres; si supera `maxChars` se muestra el toggle. */
  length: number;
  /** Umbral de caracteres a partir del cual el contenido se colapsa. */
  maxChars?: number;
  /** Clase Tailwind estática de line-clamp al colapsar (p. ej. "line-clamp-2"). */
  clampClass?: string;
}

/**
 * Contenido colapsable: si el texto es largo, lo recorta a `clampClass`
 * y muestra "Ver más" / "Ver menos". Si es corto, renderiza sin toggle.
 */
export function ExpandableContent({
  children,
  length,
  maxChars = 320,
  clampClass = "line-clamp-5",
}: ExpandableContentProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (length <= maxChars) {
    return <>{children}</>;
  }

  return (
    <div>
      <div className={expanded ? undefined : clampClass}>{children}</div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        {expanded
          ? t("home.productDetails.showLess")
          : t("home.productDetails.showMore")}
        {expanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
