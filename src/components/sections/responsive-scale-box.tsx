"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Escala un bloque de tamaño fijo (px) para que quepa en un contenedor de
 * ancho variable, preservando proporción — usado para embeber mockups de
 * tamaño fijo (ej. promo-card, pensado como imagen 1024x576) en una página
 * responsive sin que se corten en móvil.
 */
export function ResponsiveScaleBox({
  width,
  height,
  className = "",
  children,
}: {
  width: number;
  height: number;
  className?: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? width;
      setScale(w / width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden ${className}`}
      style={{ height: height * scale }}
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ResponsiveScaleBox;
