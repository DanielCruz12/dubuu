"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceRecorderStatus = "idle" | "recording";
export type VoiceRecorderError = "unsupported" | "denied" | "failed" | null;

/** Duración máxima de grabación: al llegar se detiene y entrega el audio. */
const MAX_DURATION_MS = 120_000;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Grabadora de voz con MediaRecorder (nativo, sin dependencias).
 * `onAutoStop` recibe el audio cuando se alcanza la duración máxima.
 */
export function useVoiceRecorder(
  onAutoStop?: (blob: Blob | null) => void
): {
  status: VoiceRecorderStatus;
  error: VoiceRecorderError;
  elapsedMs: number;
  /** Stream vivo del micrófono (solo durante la grabación, para visualizar). */
  stream: MediaStream | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
} {
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [error, setError] = useState<VoiceRecorderError>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);
  const onAutoStopRef = useRef(onAutoStop);
  onAutoStopRef.current = onAutoStop;

  const cleanup = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current) {
      window.clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    setStream(null);
  };

  // Soltar el micrófono si el componente se desmonta grabando.
  useEffect(() => cleanup, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("unsupported");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStream(stream);
      chunksRef.current = [];
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const resolve = resolveRef.current;
        resolveRef.current = null;
        cleanup();
        setStatus("idle");
        resolve?.(blob);
      };
      recorder.start();
      setStatus("recording");
      setElapsedMs(0);
      const startedAt = Date.now();
      timerRef.current = window.setInterval(
        () => setElapsedMs(Date.now() - startedAt),
        250
      );
      maxTimerRef.current = window.setTimeout(() => {
        const current = mediaRecorderRef.current;
        if (!current || current.state === "inactive") return;
        new Promise<Blob | null>((resolve) => {
          resolveRef.current = resolve;
          current.stop();
        }).then((blob) => onAutoStopRef.current?.(blob));
      }, MAX_DURATION_MS);
      return true;
    } catch (err) {
      cleanup();
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "denied"
          : "failed"
      );
      return false;
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      resolveRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    // Sin resolve: el audio se descarta en onstop.
    resolveRef.current = null;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      cleanup();
    }
    setStatus("idle");
  }, []);

  return {
    status,
    error,
    elapsedMs,
    stream,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
