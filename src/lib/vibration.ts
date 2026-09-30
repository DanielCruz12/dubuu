/** Vibración de éxito (100ms vibra, 30ms pausa ×3) — solo en dispositivos que la soporten. */
export function vibrateSuccess() {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  try {
    navigator.vibrate([100, 30, 100, 30, 100]);
  } catch {
    // Vibración no disponible — ignorar
  }
}
