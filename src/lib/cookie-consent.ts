export type CookieConsent = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "dubuu-cookie-consent";

export const COOKIE_CONSENT_EVENT = "dubuu:cookie-consent-changed";
export const OPEN_COOKIE_PREFERENCES_EVENT = "dubuu:open-cookie-preferences";

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function saveConsent(consent: {
  functional: boolean;
  analytics: boolean;
}): CookieConsent {
  const full: CookieConsent = {
    necessary: true,
    functional: consent.functional,
    analytics: consent.analytics,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  return full;
}

export function openCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}
