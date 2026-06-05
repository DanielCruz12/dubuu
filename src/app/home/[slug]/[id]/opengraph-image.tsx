import { ImageResponse } from "next/og";
import { getProduct, absoluteImageUrl, formatProductTitle } from "@/lib/product-data";

export const alt = "Dubuu - Experiencias de Viaje Únicas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  const bannerUrl = product ? absoluteImageUrl(product.banner) : null;
  const { title, priceStr } = product
    ? formatProductTitle(product)
    : { title: "Dubuu - Experiencias de Viaje", priceStr: "" };

  const logoUrl = "https://www.dubuu.com/icon.svg";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          fontFamily: "sans-serif",
          position: "relative",
          backgroundColor: "#1a1a2e",
          ...(bannerUrl
            ? {
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            background: "rgba(0,0,0,0.65)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 50,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Dubuu"
            width={48}
            height={48}
            style={{ borderRadius: 8 }}
          />
          <div style={{ color: "white", fontSize: 28, fontWeight: 700 }}>
            Dubuu
          </div>
        </div>

        {/* Text content */}
        <div
          style={{
            position: "relative",
            padding: "0 60px 60px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: title.length > 35 ? 40 : 52,
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: "90%",
            }}
          >
            {title}
          </div>

          {priceStr && (
            <div
              style={{
                color: "#4ade80",
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              {priceStr}
            </div>
          )}

          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 20,
              marginTop: 8,
            }}
          >
            www.dubuu.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
