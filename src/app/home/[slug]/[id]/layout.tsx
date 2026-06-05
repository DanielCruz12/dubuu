import type { Metadata } from "next";
import {
  getProduct,
  truncateText,
  formatProductTitle,
} from "@/lib/product-data";

type Props = {
  params: { slug: string; id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Producto no encontrado",
      description:
        "Este producto no está disponible en este momento. Descubre más experiencias en Dubuu.",
    };
  }

  const { title, priceStr, priceAmount } = formatProductTitle(product);
  const priceCurrency = "USD";

  const shortDesc = (product.description ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 120);
  const description = truncateText(
    [priceStr, shortDesc].filter(Boolean).join(" — "),
    155,
  );

  const canonicalUrl = `https://www.dubuu.com/home/${params.slug}/${params.id}`;

  return {
    title: truncateText(title, 60),
    description,
    other: {
      ...(priceAmount !== null &&
        priceAmount > 0 && {
          "og:price:amount": String(priceAmount),
          "og:price:currency": priceCurrency,
          "product:price.amount": String(priceAmount),
          "product:price.currency": priceCurrency,
        }),
    },
    openGraph: {
      title: truncateText(title, 60),
      description,
      url: canonicalUrl,
      siteName: "Dubuu",
      locale: "es_SV",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: truncateText(title, 60),
      description,
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
