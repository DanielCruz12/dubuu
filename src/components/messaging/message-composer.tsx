"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Check,
  Loader2,
  MapPin,
  Mic,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n-context";
import {
  useSendMessageMutation,
  useTranscribeVoiceMutation,
} from "@/redux/slices/messaging/messaging-slice";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { blobToWav16kMono } from "./audio-to-wav";
import { VoiceWaveform } from "./voice-waveform";
import type { MessageBlockedError } from "@/types/messaging";

const LocationPickerDialog = dynamic(
  () => import("./location-map").then((m) => m.LocationPickerDialog),
  { ssr: false }
);

const MAX_TEXT_LENGTH = 2000;

/** Compartir ubicación desactivado por el momento (reactivar: true). */
const LOCATION_ENABLED = false;

const VOICE_ERROR_KEY = {
  denied: "messaging.voice.denied",
  unsupported: "messaging.voice.unsupported",
  failed: "messaging.voice.failed",
} as const;

function isBlockedError(error: unknown): error is MessageBlockedError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: unknown }).status === 422
  );
}

function serverMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return undefined;
  const message = (data as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export function MessageComposer({ bookingId }: { bookingId: string }) {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [transcribe, { isLoading: isTranscribing }] =
    useTranscribeVoiceMutation();

  const transcribeBlob = useCallback(
    async (blob: Blob | null) => {
      if (!blob || blob.size === 0) return;
      setBlockedMessage(null);
      try {
        // El proveedor solo acepta WAV PCM16 mono 16 kHz: convertir primero.
        const wav = await blobToWav16kMono(blob);
        const { text: transcript } = await transcribe({
          bookingId,
          audio: wav,
        }).unwrap();
        setText((prev) =>
          `${prev ? `${prev} ` : ""}${transcript}`.slice(0, MAX_TEXT_LENGTH)
        );
      } catch (error) {
        if (isBlockedError(error)) {
          // Lo dictado activó el anti-evasión: mismo aviso que al enviar.
          setBlockedMessage(
            error.data?.message ?? t("messaging.conversation.sendError")
          );
        } else {
          toast.error(
            serverMessage(error) ?? t("messaging.voice.transcribeFailed")
          );
        }
      }
    },
    [transcribe, bookingId, t]
  );

  const {
    status: voiceStatus,
    error: voiceError,
    elapsedMs,
    stream: voiceStream,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder(transcribeBlob);

  useEffect(() => {
    if (voiceError) toast.error(t(VOICE_ERROR_KEY[voiceError]));
  }, [voiceError, t]);

  const handleSendText = async () => {
    const body = text.trim();
    if (!body || isLoading) return;
    setBlockedMessage(null);
    try {
      await sendMessage({ bookingId, input: { kind: "text", body } }).unwrap();
      setText("");
    } catch (error) {
      if (isBlockedError(error)) {
        // El backend bloqueó el mensaje (anti-evasión): aviso claro, no se envía.
        setBlockedMessage(
          error.data?.message ?? t("messaging.conversation.sendError")
        );
      } else {
        toast.error(t("messaging.conversation.sendError"));
      }
    }
  };

  const handleSendLocation = async (lat: number, lng: number, label?: string) => {
    setBlockedMessage(null);
    try {
      await sendMessage({
        bookingId,
        input: {
          kind: "location",
          location_lat: lat,
          location_lng: lng,
          location_label: label,
        },
      }).unwrap();
      setLocationOpen(false);
    } catch (error) {
      if (isBlockedError(error)) {
        setBlockedMessage(
          error.data?.message ?? t("messaging.conversation.sendError")
        );
        setLocationOpen(false);
      } else {
        toast.error(t("messaging.conversation.sendError"));
      }
    }
  };

  const handleStopAndTranscribe = async () => {
    const blob = await stopRecording();
    await transcribeBlob(blob);
  };

  const busy = isLoading || isTranscribing;
  const isRecording = voiceStatus === "recording";

  return (
    <div className="border-t bg-background p-2 sm:p-3">
      {blockedMessage && (
        <div
          role="alert"
          className="mb-2 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span className="flex-1">
            <span className="font-semibold">
              {t("messaging.conversation.blockedTitle")}.{" "}
            </span>
            {blockedMessage}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setBlockedMessage(null)}
            aria-label={t("messaging.location.cancel")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isRecording ? (
        <div className="flex min-h-10 items-center gap-2 px-1">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="text-sm tabular-nums" aria-live="off">
            {formatElapsed(elapsedMs)}
          </span>
          <VoiceWaveform
            stream={voiceStream}
            className="h-8 min-w-0 flex-1 text-red-500"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={cancelRecording}
            aria-label={t("messaging.voice.cancel")}
            title={t("messaging.voice.cancel")}
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={handleStopAndTranscribe}
            aria-label={t("messaging.voice.stopAndSend")}
            title={t("messaging.voice.stopAndSend")}
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      ) : isTranscribing ? (
        <div className="flex min-h-10 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("messaging.voice.transcribing")}
        </div>
      ) : (
        <div className="flex items-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => startRecording()}
            disabled={busy}
            aria-label={t("messaging.voice.record")}
            title={t("messaging.voice.record")}
          >
            <Mic className="h-5 w-5" />
          </Button>
          {LOCATION_ENABLED && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setLocationOpen(true)}
              disabled={busy}
              aria-label={t("messaging.conversation.shareLocation")}
              title={t("messaging.conversation.shareLocation")}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          )}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("messaging.conversation.inputPlaceholder")}
            rows={1}
            maxLength={2000}
            className="max-h-28 min-h-10 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0"
            onClick={handleSendText}
            disabled={!text.trim() || busy}
            aria-label={t("messaging.conversation.send")}
            title={t("messaging.conversation.send")}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {locationOpen && (
        <LocationPickerDialog
          open={locationOpen}
          onOpenChange={setLocationOpen}
          onSend={handleSendLocation}
          sending={isLoading}
        />
      )}
    </div>
  );
}
