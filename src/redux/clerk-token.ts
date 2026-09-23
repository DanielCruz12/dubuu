type ClerkSessionLike = {
  getToken: () => Promise<string | null>;
};

type ClerkLike = {
  session?: ClerkSessionLike;
};

/**
 * Obtiene un token de sesión FRESCO de Clerk en cada llamada (nunca cacheado).
 * Se usa desde `prepareHeaders` para que cada petición lleve un token vigente,
 * evitando sesiones expiradas en dispositivos con cookies `__session` viejas.
 */
export async function getClerkSessionToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const clerk = (window as Window & { Clerk?: ClerkLike }).Clerk;
  const session = clerk?.session;
  if (!session) return null;
  try {
    return await session.getToken();
  } catch {
    return null;
  }
}
