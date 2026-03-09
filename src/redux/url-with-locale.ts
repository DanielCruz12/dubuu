"use client";

function getLocale(): string {
  if (typeof window === "undefined") return "es";
  return (localStorage.getItem("language") as string) || "es";
}

export function urlWithLocale(url: string): string {
  const locale = getLocale();
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}locale=${encodeURIComponent(locale)}`;
}
