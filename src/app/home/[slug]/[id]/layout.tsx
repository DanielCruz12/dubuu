import type { Metadata } from "next";
import type { IProduct, ITourProduct } from "@/types/product";
import type { IRentalProduct } from "@/types/rental";

type Props = {
  params: { slug: string; id: string };
};

function getPrice(product: IProduct): number {
  if (product.product_type?.name === "rental") {
    const rental = (product as IRentalProduct).rental;
    if (rental) {
      const perDay = Number.parseFloat(String(rental.price_per_day ?? ""));
      if (Number.isFinite(perDay) && perDay > 0) return perDay;
    }
  }
  const direct = Number(product.price);
  if (Number.isFinite(direct) && direct > 0) return direct;
  if (product.product_type?.name === "tours") {
    const prices = ((product as ITourProduct).tour?.tour_dates ?? [])
      .map((d) => Number(d?.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length > 0) return Math.min(...prices);
  }
  return 0;
}

function clean(s: string) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function getApiUrl(): string {
  // Misma lógica que next.config.mjs para los rewrites
  const backendUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://dubuu-back-development.up.railway.app";
  return backendUrl.replace(/\/$/, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = params;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.dubuu.com";

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/products/${id}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`API ${res.status}`);

  const product: IProduct = await res.json();
  const banner = product.banner?.trim() || "";
  const price = getPrice(product);
  const isRental = product.product_type?.name === "rental";
  const unit = isRental ? "día" : "persona";
  const priceStr =
    price > 0 ? `Desde $${price.toFixed(2)}/${unit}` : "";

  const title = priceStr
    ? `${product.name} — ${priceStr}`
    : product.name;

  const desc = clean(product.description ?? "");
  const shortDesc = desc.length > 160 ? desc.substring(0, 157) + "..." : desc;
  const ogDescription = priceStr
    ? `${priceStr}. ${shortDesc}`
    : shortDesc;

  const pageUrl = `${siteUrl}/home/${slug}/${id}`;

  return {
    title,
    description: ogDescription,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      locale: "es_SV",
      url: pageUrl,
      siteName: "Dubuu",
      title,
      description: ogDescription,
      ...(banner && {
        images: [
          {
            url: banner,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      ...(banner && { images: [banner] }),
      creator: "@Dubuu_sv",
      site: "@Dubuu_sv",
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
