"use client";

import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { scrollToErrorField } from "./utils";

interface FlatError {
  key: string;
  message: string;
}

/** Recorre el árbol de errores de react-hook-form y extrae mensajes con su clave. */
function flattenErrors(errors: Record<string, unknown>): FlatError[] {
  const out: FlatError[] = [];
  const walk = (obj: unknown, path: string) => {
    if (!obj || typeof obj !== "object") return;
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      const record = value as { message?: unknown };
      if (record && typeof record.message === "string") {
        out.push({ key: fullPath, message: record.message });
      } else if (value && typeof value === "object") {
        walk(value, fullPath);
      }
    }
  };
  walk(errors, "");
  return out;
}

/**
 * Resumen de errores mostrado arriba del formulario tras intentar enviar.
 * Cada error hace scroll (y enfoca) al campo correspondiente.
 */
export function FormErrorSummary() {
  const { formState } = useFormContext();
  const { t } = useLanguage();

  if (formState.submitCount === 0) return null;
  const errors = flattenErrors(formState.errors);
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {t("dashboard.addTour.validation.errorsTitle")}
          </p>
          <ul className="mt-1.5 space-y-1 list-disc list-inside">
            {errors.map((error) => (
              <li key={error.key}>
                <button
                  type="button"
                  onClick={() => scrollToErrorField(error.key)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline text-left"
                >
                  {error.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
