import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS_TO_FORWARD = [
  "accept",
  "accept-encoding",
  "content-type",
  "cookie",
  "origin",
  "referer",
  "user-agent",
];

function buildBackendUrl(request: NextRequest): string | null {
  const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
  if (!backend) return null;
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const suffix = pathname.replace(/^\/backend\/socket\.io\/?/, "") || "";
  const path = "/socket.io" + (suffix ? `/${suffix}` : "") + search;
  return `${backend}${path}`;
}

function forwardHeaders(request: NextRequest): HeadersInit {
  const out: Record<string, string> = {};
  for (const name of HEADERS_TO_FORWARD) {
    const value = request.headers.get(name);
    if (value) out[name] = value;
  }
  return out;
}

export async function GET(request: NextRequest) {
  const url = buildBackendUrl(request);
  if (!url) return NextResponse.json({ error: "Backend not configured" }, { status: 502 });

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: forwardHeaders(request),
      cache: "no-store",
    });
    const body = await res.arrayBuffer();
    const response = new NextResponse(body, { status: res.status });
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== "content-encoding" && lower !== "transfer-encoding") {
        response.headers.set(key, value);
      }
    });
    return response;
  } catch (e) {
    console.error("[socket.io proxy] GET error:", e);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const url = buildBackendUrl(request);
  if (!url) return NextResponse.json({ error: "Backend not configured" }, { status: 502 });

  try {
    const body = await request.arrayBuffer();
    const res = await fetch(url, {
      method: "POST",
      headers: forwardHeaders(request),
      body,
      cache: "no-store",
    });
    const resBody = await res.arrayBuffer();
    const response = new NextResponse(resBody, { status: res.status });
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== "content-encoding" && lower !== "transfer-encoding") {
        response.headers.set(key, value);
      }
    });
    return response;
  } catch (e) {
    console.error("[socket.io proxy] POST error:", e);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
