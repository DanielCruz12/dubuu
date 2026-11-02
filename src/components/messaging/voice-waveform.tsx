"use client";

import { useEffect, useRef } from "react";

/**
 * Ondas de frecuencia en vivo del micrófono (canvas, sin re-renders).
 * Recibe el stream de `useVoiceRecorder` y lo analiza con AnalyserNode.
 * Sin stream (o sin AudioContext, o con reduced-motion) dibuja una base estática.
 */
export function VoiceWaveform({
  stream,
  className,
}: {
  stream: MediaStream | null;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef(stream);
  streamRef.current = stream;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let disposed = false;
    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    let data: Uint8Array | null = null;
    let levels: number[] = [];
    let color = "#ef4444";

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    const fitCanvas = () => {
      const scale = dpr();
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      color = getComputedStyle(canvas).color || color;
    };

    /** Barras de 3px con 3px de separación (en px CSS). */
    const layout = () => {
      const scale = dpr();
      const count = Math.max(
        8,
        Math.min(64, Math.floor(canvas.clientWidth / 6))
      );
      if (levels.length !== count) levels = new Array(count).fill(0);
      return { count, slot: canvas.width / count, bar: 3 * scale };
    };

    const drawBar = (x: number, height: number, width: number) => {
      const h = Math.max(3, height);
      const y = (canvas.height - h) / 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, width, h, width / 2);
      } else {
        ctx.rect(x, y, width, h);
      }
      ctx.fill();
    };

    const drawIdle = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.35;
      const { count, slot, bar } = layout();
      for (let i = 0; i < count; i++) {
        drawBar(i * slot + (slot - bar) / 2, 3, bar);
      }
      ctx.globalAlpha = 1;
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resizeObserver = new ResizeObserver(() => {
      fitCanvas();
      // Sin animación activa, repintar la base para no dejar el canvas vacío.
      if (!analyser || reducedMotion) drawIdle();
    });

    fitCanvas();
    resizeObserver.observe(canvas);

    const liveStream = streamRef.current;
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!liveStream || !AudioCtor || reducedMotion) {
      drawIdle();
      return () => resizeObserver.disconnect();
    }

    try {
      audioCtx = new AudioCtor();
      source = audioCtx.createMediaStreamSource(liveStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      data = new Uint8Array(analyser.frequencyBinCount);
    } catch {
      drawIdle();
      return () => resizeObserver.disconnect();
    }

    const tick = () => {
      if (disposed || !analyser || !data) return;
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      const { count, slot, bar } = layout();
      // Voz concentrada en frecuencias bajas: usar los primeros 2/3 del espectro.
      const usable = Math.floor(data.length * 0.7);
      for (let i = 0; i < count; i++) {
        const bin = data[Math.floor((i / count) * usable)] / 255;
        levels[i] += (bin - levels[i]) * 0.35;
        drawBar(
          i * slot + (slot - bar) / 2,
          levels[i] * (canvas.height - 4),
          bar
        );
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      source?.disconnect();
      // El hook dueño del stream lo detiene; aquí solo se cierra el análisis.
      audioCtx?.close().catch(() => undefined);
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "h-8 w-full"}
    />
  );
}
