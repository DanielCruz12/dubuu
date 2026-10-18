"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { vibrateSuccess, vibrateTap } from "@/lib/vibration";

const THUMB_SIZE = 48; // h-12 w-12
const TRACK_PADDING = 8; // p-2 del carril
const COMPLETE_THRESHOLD = 0.9; // % del recorrido para completar
const MIN_DRAG = 12; // px mínimos de arrastre para considerarlo un gesto intencional

interface SlideToPayProps {
  onComplete: () => void;
  label?: string;
  completedLabel?: string;
  loadingLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function SlideToPay({
  onComplete,
  label = "Desliza para pagar",
  completedLabel,
  loadingLabel,
  disabled = false,
  loading = false,
  className,
}: SlideToPayProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startClientX: number;
    startLeft: number;
    moved: number;
  } | null>(null);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  const [left, setLeft] = useState(0);
  const [maxLeft, setMaxLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [dragging, setDragging] = useState(false);

  const measureMax = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.clientWidth - THUMB_SIZE - TRACK_PADDING * 2);
  }, []);

  const finish = useCallback(() => {
    const max = measureMax();
    setMaxLeft(max);
    setLeft(max);
    setCompleted(true);
    vibrateSuccess();
    onComplete();
    // Si no entra en estado de carga (p. ej. falló la validación), el carril regresa
    setTimeout(() => {
      if (!loadingRef.current) {
        setLeft(0);
        setCompleted(false);
      }
    }, 900);
  }, [measureMax, onComplete]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || loading || completed) return;
    const max = measureMax();
    if (max <= 0) return;
    setMaxLeft(max);
    setDragging(true);
    vibrateTap();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startClientX: e.clientX, startLeft: left, moved: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startClientX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    setLeft(Math.min(maxLeft, Math.max(0, drag.startLeft + dx)));
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    if (
      drag.moved >= MIN_DRAG &&
      maxLeft > 0 &&
      left >= maxLeft * COMPLETE_THRESHOLD
    ) {
      finish();
    } else {
      setLeft(0); // regresa al inicio
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || loading || completed) return;
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      finish();
    }
  };

  const progress = maxLeft > 0 ? Math.min(1, left / maxLeft) : 0;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "relative h-14 w-full select-none touch-none overflow-hidden rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled || loading
          ? "cursor-not-allowed opacity-60"
          : completed
            ? "border-emerald-500/60 bg-emerald-500/10"
            : "border-primary/50 bg-primary/5 cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* Relleno detrás del pulgar */}
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary/15 transition-[width] duration-75"
        style={{ width: left + THUMB_SIZE + TRACK_PADDING }}
      />

      {/* Etiqueta central */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold transition-opacity",
          completed
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-foreground",
        )}
        style={{ opacity: maxLeft > 0 ? Math.max(0, 1 - progress * 1.4) : 1 }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingLabel}
          </>
        ) : completed ? (
          <>
            <Check className="h-4 w-4" />
            {completedLabel}
          </>
        ) : (
          <>
            {label}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </span>

      {/* Pulgar */}
      <div
        className={cn(
          "absolute left-0 top-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md",
          !dragging && "transition-transform duration-200 ease-out",
        )}
        style={{ transform: `translate(${TRACK_PADDING + left}px, -50%)` }}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : completed ? (
          <Check className="h-5 w-5" />
        ) : (
          <ArrowRight className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}
