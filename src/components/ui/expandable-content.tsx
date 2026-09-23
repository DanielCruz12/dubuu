"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

interface ExpandableContentProps {
  children: ReactNode;
  /** Longitud del contenido en caracteres (solo como atajo para textos muy cortos). */
  length: number;
  /** Por debajo de este umbral nunca se muestra el toggle. */
  minChars?: number;
  /** Clase Tailwind estática de line-clamp al colapsar (p. ej. "line-clamp-2"). */
  clampClass?: string;
}

/**
 * Contenido colapsable: mide si el contenido realmente se recorta
 * (scrollHeight vs clientHeight) y solo entonces muestra "Ver más"/"Ver menos".
 * Re-mide al cambiar el tamaño, con el resize del contenedor y al cargar las fuentes.
 */
export function ExpandableContent({
  children,
  length,
  minChars = 120,
  clampClass = "line-clamp-5",
}: ExpandableContentProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded) return;
    const el = contentRef.current;
    if (!el || length < minChars) return;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    document.fonts?.ready?.then(check).catch(() => {});
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [length, minChars, expanded]);

  if (length < minChars) {
    return <>{children}</>;
  }

  if (!overflowing && !expanded) {
    return <div ref={contentRef}>{children}</div>;
  }

  return (
    <div>
      <div ref={contentRef} className={expanded ? undefined : clampClass}>
        {children}
      </div>
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
