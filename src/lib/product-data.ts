import { cache } from "react";

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const API_BASE =
  process.env.BACKEND_URL?.replace(/\/$/, "") ||
  `${SITE_ORIGIN}/backend`;

const CDN_BASE =
  process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/$/, "") ||
  "https://www.dubuu.com";

export interface SeoProduct {
  name: string;
  description: string;
  banner: string;
  price: number;
  updated_at: string;
  product_type: { name: string };
  tour?: { tour_dates: { price?: number }[] };
  rental?: { brand: string; model: string; year: number; price_per_day: string };
}

export function absoluteImageUrl(src: string | null | undefined): string | null {
  const trimmed = (src ?? "").trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${CDN_BASE}/${trimmed.replace(/^\//, "")}`;
}

export const getProduct = cache(async (id: string): Promise<SeoProduct | null> => {
  const url = `${API_BASE}/api/v1/products/${id}?locale=es`;
  console.log("[getProduct] URL:", url);
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    console.log("[getProduct] status:", res.status, res.statusText);
    if (!res.ok) {
      console.warn("[getProduct] FAILED — status:", res.status);
      return null;
    }
    const data = await res.json();
    console.log("[getProduct] OK — name:", data?.name, "| banner:", data?.banner);
    return data;
  } catch (err) {
    console.error("[getProduct] ERROR:", err);
    return null;
  }
});

export function isRental(p: SeoProduct) {
  const name = p.product_type?.name?.toLowerCase() ?? "";
  return name.includes("rental") || name.includes("alquiler") || !!p.rental;
}

export function isTour(p: SeoProduct) {
  const name = p.product_type?.name?.toLowerCase() ?? "";
  return name === "tours" || name === "tour" || name === "viajes" || !!p.tour;
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 1) + "…";
}

export function formatProductTitle(p: SeoProduct): {
  title: string;
  priceStr: string;
  priceAmount: number | null;
} {
  let title = p.name;
  let priceStr = "";
  let priceAmount: number | null = null;

  if (isRental(p) && p.rental) {
    const r = p.rental;
    const headerParts = [r.brand, r.model, r.year].filter(Boolean);
    const header = headerParts.length > 0 ? headerParts.join(" ") : p.name;
    priceAmount = Number(r.price_per_day) || Number(p.price) || 0;
    if (priceAmount > 0) {
      priceStr = `Desde $${priceAmount}/día`;
      title = `${header} — ${priceStr}`;
    } else {
      title = header;
    }
  } else if (isTour(p) && p.tour) {
    const prices = (p.tour.tour_dates ?? [])
      .map((d) => Number(d?.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    priceAmount =
      prices.length > 0 ? Math.min(...prices) : Number(p.price) || 0;
    if (priceAmount > 0) {
      priceStr = `Desde $${priceAmount}/persona`;
      title = `${p.name} — ${priceStr}`;
    }
  }

  return { title, priceStr, priceAmount };
}
