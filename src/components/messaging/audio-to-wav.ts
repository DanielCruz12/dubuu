/**
 * Convierte un Blob de audio (webm/mp4 de MediaRecorder) a WAV PCM16 mono
 * 16 kHz, el formato que acepta `POST /v1/asr/transcribe`.
 * Usa Web Audio API (nativo, sin dependencias).
 */

const TARGET_SAMPLE_RATE = 16000;

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    webkitAudioContext?: typeof AudioContext;
  };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

function getOfflineClass(): typeof OfflineAudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
  };
  return window.OfflineAudioContext ?? w.webkitOfflineAudioContext ?? null;
}

function writeString(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export async function blobToWav16kMono(blob: Blob): Promise<Blob> {
  const AudioCtx = getAudioContextClass();
  const OfflineCtx = getOfflineClass();
  if (!AudioCtx || !OfflineCtx) {
    throw new Error("Web Audio no soportado en este navegador.");
  }
  const ctx = new AudioCtx();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    const length = Math.max(
      1,
      Math.floor(decoded.duration * TARGET_SAMPLE_RATE)
    );
    // OfflineAudioContext remuestrea a 16 kHz y mezcla a mono solo.
    const offline = new OfflineCtx(1, length, TARGET_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return encodeWav(rendered.getChannelData(0), TARGET_SAMPLE_RATE);
  } finally {
    await ctx.close().catch(() => {});
  }
}
