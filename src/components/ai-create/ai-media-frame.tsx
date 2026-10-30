"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AiMediaFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Borde punteado para la zona de subida. */
  dashed?: boolean;
}

/**
 * Marco multimedia único del flujo IA: input, proceso y portada comparten
 * la misma caja (16:9, fluida hasta 400px, centrada). El contenido que deba
 * llenarla usa `absolute inset-0` (nunca alturas en %).
 */
export function AiMediaFrame({ children, dashed, className, ...rest }: AiMediaFrameProps) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[16/9] w-full max-w-[400px] overflow-hidden rounded-xl border bg-black",
        dashed ? "border-dashed border-white/15" : "border-white/10",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
