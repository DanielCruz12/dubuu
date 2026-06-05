import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { ProductBookingContent } from "./product-booking-content";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductApiResponse {
  id: string;
  name: string;
  description: string;
  banner: string | null;
  price: number;
  updated_at: string;
  product_type?: { id?: string; name: string };
}

type PageProps = {
  params: { slug: string; id: string };
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const APP_DOMAIN = "https://www.dubuu.com";
const DEFAULT_OG_IMAGE = `${APP_DOMAIN}/og-image.jpg`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveImageUrl(bannerUrl: string | undefined | null): string {
  if (!bannerUrl?.trim()) return DEFAULT_OG_IMAGE;

  const trimmed = bannerUrl.trim();

  // URL absoluta → tal cual
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Ruta relativa → anteponer dominio
  return `${APP_DOMAIN}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

function truncateDescription(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text;
  const cut = text.substring(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? `${cut.substring(0, lastSpace)}...` : `${cut}...`;
}

function apiUrl(id: string): string {
  const base = (process.env.BACKEND_URL || "http://localhost:3002").replace(
    /\/$/,
    "",
  );
  return `${base}/api/v1/products/${id}`;
}

// ---------------------------------------------------------------------------
// Data fetching (deduplicada con React cache)
// ---------------------------------------------------------------------------

const getProduct = cache(
  async (id: string): Promise<ProductApiResponse | null> => {
    try {
      const res = await fetch(apiUrl(id), {
        next: { revalidate: 3600 },
      });

      if (!res.ok) return null;

      const data: ProductApiResponse = await res.json();
      return data;
    } catch {
      return null;
    }
  },
);

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, id } = params;

  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscas no está disponible en este momento.",
      openGraph: {
        images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
      },
    };
  }

  const title = product.name;
  const description = truncateDescription(product.description);
  const imageUrl = resolveImageUrl(product.banner);
  const canonicalUrl = `${APP_DOMAIN}/home/${slug}/${id}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      siteName: "Dubuu",
      locale: "es_SV",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@Dubuu_sv",
      site: "@Dubuu_sv",
    },
  };
}

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function ProductPage({ params }: PageProps) {
  const { slug, id } = params;

  const product = await getProduct(id);
  console.log(slug);

  if (!product) notFound();

  return (
    <Suspense>
      <ProductBookingContent />
    </Suspense>
  );
}
