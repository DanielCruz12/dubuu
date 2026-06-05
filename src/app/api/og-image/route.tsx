import { NextResponse } from "next/server";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");
  const width = Math.min(Number(searchParams.get("width")) || 1200, 2000);
  const height = Math.min(Number(searchParams.get("height")) || 630, 2000);

  if (!imageUrl) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  try {
    const originRes = await fetch(imageUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (!originRes.ok) {
      return new NextResponse("Failed to fetch source image", {
        status: 502,
      });
    }

    const contentType = originRes.headers.get("content-type") ?? "";
    const arrayBuffer = await originRes.arrayBuffer();

    // Si ya es <= 600 KB y las dimensiones son razonables, servir tal cual
    if (
      arrayBuffer.byteLength <= 600 * 1024 &&
      contentType.startsWith("image/")
    ) {
      return new NextResponse(new Uint8Array(arrayBuffer), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": `public, max-age=${MAX_AGE}, immutable`,
          "CDN-Cache-Control": `public, max-age=${MAX_AGE}, immutable`,
        },
      });
    }

    // Redimensionar con sharp
    const sharp = (await import("sharp")).default;
    const resized = await sharp(Buffer.from(arrayBuffer))
      .resize(width, height, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toBuffer();

    return new NextResponse(new Uint8Array(resized), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": `public, max-age=${MAX_AGE}, immutable`,
        "CDN-Cache-Control": `public, max-age=${MAX_AGE}, immutable`,
      },
    });
  } catch {
    return new NextResponse("Error processing image", { status: 500 });
  }
}
