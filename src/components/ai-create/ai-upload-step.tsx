"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ImageIcon, X, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_MAX_IMAGE_MB, AI_ALLOWED_TYPES } from "./ai-constants";
import { AiMediaFrame } from "./ai-media-frame";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

interface AiUploadStepProps {
  file: File | null;
  preview: string | null;
  onFileChange: (file: File | null) => void;
  onGenerate: () => void;
  generating?: boolean;
  error?: string | null;
}

export function AiUploadStep({
  file,
  preview,
  onFileChange,
  onGenerate,
  generating,
  error,
}: AiUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { t } = useLanguage();

  const validateAndSet = useCallback(
    (f: File) => {
      setLocalError(null);
      if (!AI_ALLOWED_TYPES.includes(f.type as never) && !f.type.startsWith("image/")) {
        setLocalError(t("dashboard.aiCreate.errors.localFormat"));
        return;
      }
      const mb = f.size / 1024 / 1024;
      if (mb > AI_MAX_IMAGE_MB) {
        setLocalError(
          t("dashboard.aiCreate.errors.localTooBig")
            .replace("{{max}}", String(AI_MAX_IMAGE_MB))
            .replace("{{size}}", mb.toFixed(1)),
        );
        return;
      }
      onFileChange(f);
    },
    [onFileChange, t],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSet(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <AiMediaFrame
        dashed
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={t("dashboard.aiCreate.dropAria")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "cursor-pointer transition-all duration-300",
          dragOver && "border-coast-300 bg-coast-500/10 shadow-[0_0_30px_rgba(51,150,255,0.25)]",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={AI_ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={onInputChange}
        />

        {!file || !preview ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/[0.02] p-3 text-center">
            <div className="h-9 w-9 rounded-lg bg-coast-500/15 border border-coast-400/25 flex items-center justify-center shadow-[0_0_18px_rgba(51,150,255,0.2)]">
              <Upload className="h-4 w-4 text-coast-200" />
            </div>
            <p className="mt-1.5 text-[13px] font-medium text-white">
              {t("dashboard.aiCreate.dropHint")}{" "}
              <span className="text-coast-300">{t("dashboard.aiCreate.dropClick")}</span>
            </p>
            <p className="mt-1 text-[10px] text-zinc-500">
              {t("dashboard.aiCreate.dropFormats").replace("{{mb}}", String(AI_MAX_IMAGE_MB))}
            </p>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={t("dashboard.aiCreate.previewAlt")} className="absolute inset-0 h-full w-full object-cover" />
            <span className="pointer-events-none absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-coast-300/80 rounded-tl" />
            <span className="pointer-events-none absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-coast-300/80 rounded-tr" />
            <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-coast-300/80 rounded-bl" />
            <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-coast-300/80 rounded-br" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/70 backdrop-blur border border-white/10 text-white hover:bg-black/90"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              aria-label={t("dashboard.aiCreate.removeImage")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <p className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 truncate rounded-md border border-white/10 bg-black/70 px-2 py-1 text-[11px] text-zinc-300 backdrop-blur">
              <ImageIcon className="h-3 w-3 shrink-0" />
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </>
        )}
      </AiMediaFrame>

      {(localError || error) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{localError ?? error}</span>
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-6 bg-gradient-to-t from-black via-black/90 to-transparent px-6 pb-1 pt-4">
      <Button
        type="button"
        onClick={onGenerate}
        disabled={!file || !preview || generating}
        className="h-10 sm:h-9 w-full rounded-xl bg-coast-500 text-white font-semibold shadow-md transition-all hover:bg-coast-400 active:scale-[0.98] disabled:opacity-50"
      >
        {generating ? (
          t("dashboard.aiCreate.generating")
        ) : (
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t("dashboard.aiCreate.generateButton")}
          </span>
        )}
      </Button>
      </div>
    </div>
  );
}
