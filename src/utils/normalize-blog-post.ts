import type { IBlogPost } from "@/types/blog";

function pickString(
  r: Record<string, unknown>,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const v = r[key];
    if (v != null && v !== "") return String(v);
  }
  return fallback;
}

function pickNullableString(
  r: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const v = r[key];
    if (v != null && String(v) !== "") return String(v);
  }
  return null;
}

function pickNumber(
  r: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const v = r[key];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

/** Desanida payloads típicos: `{ data: { post } }`, `{ data: [post] }`, JSON:API, etc. */
export function unwrapBlogPayload(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (Array.isArray(raw)) {
    return raw.length > 0 ? unwrapBlogPayload(raw[0]) : {};
  }
  if (typeof raw !== "object") return {};

  const root = raw as Record<string, unknown>;

  // Resultados tipo ORM: `{ rows: [ post ] }` / `{ recordset: [ post ] }`
  for (const key of ["rows", "recordset"] as const) {
    const arr = root[key];
    if (Array.isArray(arr) && arr.length === 1) {
      return unwrapBlogPayload(arr[0]);
    }
  }

  let cur: unknown = root;
  const wrapperKeys = [
    "data",
    "payload",
    "post",
    "item",
    "result",
    "blogPost",
    "blog_post",
    "blog",
    "record",
    "entity",
    "response",
  ];

  for (let depth = 0; depth < 8; depth++) {
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) break;
    const o = cur as Record<string, unknown>;
    let inner: unknown = null;
    for (const k of wrapperKeys) {
      const v = o[k];
      if (v == null) continue;
      if (Array.isArray(v)) {
        // Muchos backends devuelven `{ data: [ { ...post } ] }` en el detalle
        if (v.length > 0 && v[0] != null && typeof v[0] === "object") {
          inner = v[0];
          break;
        }
        continue;
      }
      if (typeof v === "object") {
        inner = v;
        break;
      }
    }
    if (inner) cur = inner;
    else break;
  }

  if (!cur || typeof cur !== "object" || Array.isArray(cur)) return {};
  const o = cur as Record<string, unknown>;
  if (o.attributes != null && typeof o.attributes === "object") {
    return { ...o, ...(o.attributes as Record<string, unknown>) };
  }
  return o;
}

function pickReadingMinutes(r: Record<string, unknown>): number | null {
  const direct = pickNumber(r, [
    "reading_time_minutes",
    "readingTimeMinutes",
    "read_time_minutes",
    "readTimeMinutes",
  ]);
  if (direct != null) return direct;

  const rt = r.reading_time ?? r.readingTime ?? r.read_time ?? r.readTime;
  if (typeof rt === "number" && !Number.isNaN(rt)) return rt;
  if (typeof rt === "string") {
    const m = rt.match(/(\d+)\s*min/i) ?? rt.match(/^(\d+)\s*$/);
    if (m) return Number(m[1]);
  }
  return null;
}

/** Adapta distintos nombres de columnas / serialización del backend. */
export function normalizeBlogPost(raw: unknown): IBlogPost {
  const r = unwrapBlogPayload(raw);

  const authorObj =
    r.author && typeof r.author === "object"
      ? (r.author as Record<string, unknown>)
      : null;

  let authorName: string | null = null;
  if (typeof r.author === "string" && r.author.trim()) {
    authorName = r.author.trim();
  } else {
    const fromRoot = pickNullableString(r, [
      "author_name",
      "authorName",
      "writer",
      "written_by",
    ]);
    const fromNested = authorObj
      ? pickString(authorObj, ["name", "username", "displayName"], "")
      : "";
    const authorNameRaw = fromRoot ?? (fromNested || null);
    authorName =
      authorNameRaw && authorNameRaw.trim() ? authorNameRaw.trim() : null;
  }

  const authorAvatar =
    pickNullableString(r, [
      "author_avatar",
      "authorAvatar",
      "author_image",
      "authorImage",
    ]) ??
    (authorObj
      ? pickNullableString(authorObj, [
          "avatar",
          "image",
          "avatar_url",
          "avatarUrl",
          "photo",
        ])
      : null);

  return {
    id: pickString(r, ["id", "uuid", "_id"]),
    title: pickString(r, [
      "title",
      "name",
      "headline",
      "post_title",
      "postTitle",
      "subject",
    ]),
    excerpt: pickString(r, [
      "excerpt",
      "summary",
      "description",
      "subtitle",
      "lead",
    ]),
    content: pickString(r, [
      "content",
      "body",
      "html",
      "article",
      "article_body",
      "articleBody",
      "content_html",
      "contentHtml",
      "html_content",
      "htmlContent",
      "long_description",
      "longDescription",
      "rich_text",
      "richText",
      "markdown",
      "text",
    ]),
    category: pickString(r, [
      "category",
      "category_name",
      "categoryName",
      "tag",
      "section",
    ]),
    published_at: pickString(r, [
      "published_at",
      "publishedAt",
      "created_at",
      "createdAt",
      "date",
      "published",
    ]),
    updated_at: pickString(r, ["updated_at", "updatedAt"], "") || undefined,
    cover_image: pickNullableString(r, [
      "cover_image",
      "coverImage",
      "image_url",
      "imageUrl",
      "featured_image",
      "featuredImage",
      "thumbnail",
      "banner",
      "image",
      "hero_image",
      "heroImage",
    ]),
    author_name: authorName || null,
    author_avatar: authorAvatar,
    reading_time_minutes: pickReadingMinutes(r),
    comments_count:
      pickNumber(r, ["comments_count", "commentsCount", "comments"]) ?? 0,
  };
}
