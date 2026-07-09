export function DotGridBackground({
  dark = true,
  className = "",
  edgeFade = false,
  edgeFadeSize = 200,
}: {
  dark?: boolean;
  className?: string;
  /** Si es true, los puntos se desvanecen cerca del borde superior/inferior
   * en vez de mantener la misma intensidad hasta el límite de la sección —
   * evita que el patrón "delate" la costura entre secciones claras/oscuras. */
  edgeFade?: boolean;
  edgeFadeSize?: number;
}) {
  const maskImage = edgeFade
    ? `linear-gradient(to bottom, transparent 0, black ${edgeFadeSize}px, black calc(100% - ${edgeFadeSize}px), transparent 100%)`
    : undefined;

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(${
          dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.12)"
        } 1.5px, transparent 1.5px)`,
        backgroundSize: "30px 30px",
        WebkitMaskImage: maskImage,
        maskImage,
      }}
      aria-hidden="true"
    />
  );
}

export default DotGridBackground;
