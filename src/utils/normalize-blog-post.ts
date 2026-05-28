import type { IBlogPost, IBlogSection } from "@/types/blog"

function pickString(r: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const v = r[key]
    if (v != null && v !== "") return String(v)
  }
  return fallback
}

function pickNullableString(r: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = r[key]
    if (v != null && String(v) !== "") return String(v)
  }
  return null
}

function pickNumber(r: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const v = r[key]
    if (typeof v === "number" && !Number.isNaN(v)) return v
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return null
}

function pickBoolean(r: Record<string, unknown>, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const v = r[key]
    if (typeof v === "boolean") return v
  }
  return undefined
}

function normalizeSections(raw: unknown): IBlogSection[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => {
      const sec = s as Record<string, unknown>
      return {
        title: sec.title ? String(sec.title) : "",
        content: sec.content ? String(sec.content) : "",
        images: Array.isArray(sec.images) ? sec.images.filter((i: unknown) => i && String(i).trim()) : [],
        videos: Array.isArray(sec.videos) ? sec.videos.filter((v: unknown) => v && String(v).trim()) : [],
        order: typeof sec.order === "number" ? sec.order : 0,
      }
    })
  }
  return []
}

function pickStringArray(r: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const v = r[key]
    if (Array.isArray(v)) return v.filter((i: unknown) => i && String(i).trim() !== "")
  }
  return []
}

function getFirstSectionExcerpt(sections: IBlogSection[]): string {
  for (const s of sections) {
    if (s.content?.trim()) {
      return s.content.trim().slice(0, 200)
    }
  }
  return ""
}

export function unwrapBlogPayload(raw: unknown): Record<string, unknown> {
  if (raw == null) return {}
  if (Array.isArray(raw)) {
    return raw.length > 0 ? unwrapBlogPayload(raw[0]) : {}
  }
  if (typeof raw !== "object") return {}

  const root = raw as Record<string, unknown>

  for (const key of ["rows", "recordset"] as const) {
    const arr = root[key]
    if (Array.isArray(arr) && arr.length === 1) {
      return unwrapBlogPayload(arr[0])
    }
  }

  let cur: unknown = root
  const wrapperKeys = [
    "data", "payload", "post", "item", "result",
    "blogPost", "blog_post", "blog", "record", "entity", "response",
  ]

  for (let depth = 0; depth < 8; depth++) {
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) break
    const o = cur as Record<string, unknown>
    let inner: unknown = null
    for (const k of wrapperKeys) {
      const v = o[k]
      if (v == null) continue
      if (Array.isArray(v)) {
        if (v.length > 0 && v[0] != null && typeof v[0] === "object") {
          inner = v[0]
          break
        }
        continue
      }
      if (typeof v === "object") {
        inner = v
        break
      }
    }
    if (inner) cur = inner
    else break
  }

  if (!cur || typeof cur !== "object" || Array.isArray(cur)) return {}
  const o = cur as Record<string, unknown>
  if (o.attributes != null && typeof o.attributes === "object") {
    return { ...o, ...(o.attributes as Record<string, unknown>) }
  }
  return o
}

function pickReadingMinutes(r: Record<string, unknown>): number | null {
  const direct = pickNumber(r, [
    "reading_time_minutes", "readingTimeMinutes",
    "read_time_minutes", "readTimeMinutes",
  ])
  if (direct != null) return direct
  const rt = r.reading_time ?? r.readingTime ?? r.read_time ?? r.readTime
  if (typeof rt === "number" && !Number.isNaN(rt)) return rt
  if (typeof rt === "string") {
    const m = rt.match(/(\d+)\s*min/i) ?? rt.match(/^(\d+)\s*$/)
    if (m) return Number(m[1])
  }
  return null
}

export function normalizeBlogPost(raw: unknown): IBlogPost {
  const r = unwrapBlogPayload(raw)

  const sections = normalizeSections(r.content)

  const authorName =
    pickNullableString(r, ["author_bio", "author_name", "authorName", "author", "writer"]) ??
    pickString(r, ["author_bio"], "")

  const authorAvatar = pickNullableString(r, [
    "author_avatar", "authorAvatar", "author_image", "authorImage",
  ])

  return {
    id: pickString(r, ["id", "uuid", "_id"]),
    title: pickString(r, ["title", "name", "headline", "post_title", "postTitle"]),
    slug: pickString(r, ["slug"]),
    excerpt: pickString(r, ["excerpt", "summary", "description", "subtitle"]) || getFirstSectionExcerpt(sections),
    content: sections,
    category: pickString(r, ["category", "category_name", "categoryName", "tag"]),
    category_id: pickNullableString(r, ["category_id", "categoryId"]) ?? undefined,
    published_at: pickString(r, ["published_at", "publishedAt", "created_at", "createdAt", "date"]),
    updated_at: pickString(r, ["updated_at", "updatedAt"], "") || undefined,
    cover_image: pickNullableString(r, [
      "cover_image", "coverImage", "image_url", "imageUrl",
      "featured_image", "featuredImage", "thumbnail", "banner", "image",
    ]),
    images: pickStringArray(r, ["images"]),
    videos: pickStringArray(r, ["videos"]),
    author_name: authorName || null,
    author_avatar: authorAvatar,
    reading_time_minutes: pickReadingMinutes(r),
    is_approved: pickBoolean(r, ["is_approved", "isApproved", "approved"]),
    is_published: pickBoolean(r, ["is_published", "isPublished", "published"]),
    likes_count: pickNumber(r, ["likes_count", "likesCount", "likes"]) ?? 0,
  }
}
