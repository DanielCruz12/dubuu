const DARK = "9,9,11"; // rgb de zinc-950, el tono de fondo de las secciones oscuras

/**
 * Banda de transición entre una sección oscura y una sección clara (o
 * viceversa). Usa un degradado con varios stops (curva "eased") en vez de un
 * linear-gradient de 2 puntos — así se evita la franja de gris uniforme que
 * delata la costura — y un glow radial sutil centrado, estilo Linear/Vercel.
 */
export function SectionFadeTransition({
  position,
  className = "",
}: {
  position: "top" | "bottom";
  className?: string;
}) {
  const isTop = position === "top";
  const dir = isTop ? "to bottom" : "to top";

  const gradient = `linear-gradient(${dir},
    rgba(${DARK},1) 0%,
    rgba(${DARK},1) 15%,
    rgba(${DARK},0.85) 30%,
    rgba(${DARK},0.5) 50%,
    rgba(${DARK},0.15) 75%,
    rgba(${DARK},0) 100%)`;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 h-[170px] md:h-[220px] ${
        isTop ? "top-0" : "bottom-0"
      } ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div
        className={`absolute inset-x-0 mx-auto h-full max-w-[560px] ${
          isTop ? "top-0" : "bottom-0"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)",
        }}
      />
    </div>
  );
}

export default SectionFadeTransition;
