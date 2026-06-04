import type { Metadata } from "next";

type Props = {
  params: { slug: string; id: string };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3002";

interface SeoProduct {
  name: string;
  description: string;
  banner: string;
  price: number;
  updated_at: string;
  product_type: { name: string };
  tour?: {
    tour_dates: { price?: number }[];
  };
  rental?: {
    brand: string;
    model: string;
    year: number;
    price_per_day: string;
  };
}

async function fetchProduct(id: string): Promise<SeoProduct | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/products/${id}?locale=es`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function isRental(p: SeoProduct) {
  const name = p.product_type?.name?.toLowerCase() ?? "";
  return name.includes("rental") || name.includes("alquiler") || !!p.rental;
}

function isTour(p: SeoProduct) {
  const name = p.product_type?.name?.toLowerCase() ?? "";
  return (
    name === "tours" || name === "tour" || name === "viajes" || !!p.tour
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProduct(params.id);

  if (!product) {
    return {
      title: "Producto no encontrado",
      description:
        "Este producto no está disponible en este momento. Descubre más experiencias en Dubuu.",
    };
  }

  const imageUrl = product.banner?.trim() || null;
  const fallbackImage = "https://www.dubuu.com/og-image.jpg";
  const cacheBust = product.updated_at
    ? `?v=${encodeURIComponent(product.updated_at)}`
    : "";

  let title = product.name;
  let description = "";

  if (isRental(product) && product.rental) {
    const r = product.rental;
    const headerParts = [r.brand, r.model, r.year].filter(Boolean);
    const header = headerParts.length > 0 ? headerParts.join(" ") : product.name;
    title = header;

    const pricePerDay =
      Number(r.price_per_day) || Number(product.price) || 0;
    const priceStr =
      pricePerDay > 0 ? `Desde $${pricePerDay}/día` : "";
    const shortDesc = (product.description ?? "").replace(/\s+/g, " ").trim().substring(0, 100);
    description = [header, priceStr, shortDesc].filter(Boolean).join(" — ");
  } else if (isTour(product) && product.tour) {
    const prices = (product.tour.tour_dates ?? [])
      .map((d) => Number(d?.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    const minPrice =
      prices.length > 0
        ? Math.min(...prices)
        : Number(product.price) || 0;
    const priceStr =
      minPrice > 0 ? `Desde $${minPrice}/persona` : "";
    const shortDesc = (product.description ?? "").replace(/\s+/g, " ").trim().substring(0, 100);
    description = [priceStr, shortDesc].filter(Boolean).join(" — ");
  } else {
    description = (product.description ?? "").replace(/\s+/g, " ").trim().substring(0, 160);
  }

  const canonicalUrl = `https://www.dubuu.com/home/${params.slug}/${params.id}`;
  const resolvedImage = imageUrl
    ? `${imageUrl}${cacheBust}`
    : fallbackImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Dubuu",
      locale: "es_SV",
      type: "website",
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedImage],
      creator: "@Dubuu_sv",
      site: "@Dubuu_sv",
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
