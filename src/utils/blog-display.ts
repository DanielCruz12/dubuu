import { getLocale } from "@/redux/url-with-locale"
import type { IBlogPost } from "@/types/blog"

const PLACEHOLDER_LOGO = "/logo.svg"

export function formatBlogDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(getLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatReadTime(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return "—"
  const loc = getLocale()
  if (loc.startsWith("es")) return `${minutes} min de lectura`
  return `${minutes} min read`
}

export function resolveAuthorAvatar(url: string | null | undefined): string | undefined {
  if (!url || url === PLACEHOLDER_LOGO) return undefined
  return url
}

export function getContentPreview(post: IBlogPost): string {
  if (post.excerpt) return post.excerpt
  for (const section of post.content || []) {
    if (section.content?.trim()) {
      return section.content.trim().slice(0, 200)
    }
  }
  return ""
}

export function postToCardProps(post: IBlogPost) {
  return {
    title: post.title || "Sin título",
    excerpt: getContentPreview(post),
    category: post.category || "Blog",
    date: formatBlogDate(post.published_at),
    readTime: formatReadTime(post.reading_time_minutes),
    image: post.cover_image || PLACEHOLDER_LOGO,
    author: {
      name: post.author_name || "Dubuu",
      avatar: resolveAuthorAvatar(post.author_avatar),
    },
  }
}
