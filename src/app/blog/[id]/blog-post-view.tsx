"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, ChevronRight, Clock, Share2 } from "lucide-react"
import Image from "next/image"
import { BlogBody } from "@/components/blog/blog-body"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetBlogPostQuery } from "@/redux/slices/blog/blog-slice"
import { formatBlogDate, formatReadTime, resolveAuthorAvatar } from "@/utils/blog-display"
import { useLanguage } from "@/lib/i18n-context"

export function BlogPostView({ id }: { id: string }) {
  const { t } = useLanguage()
  const { data: post, isLoading, isError, isFetching, refetch } = useGetBlogPostQuery(id, { skip: !id })

  // ── No ID ──
  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="mb-4 text-muted-foreground">{t("blog.invalidLink")}</p>
        <Button asChild variant="secondary">
          <Link href="/blog">{t("blog.backToBlog")}</Link>
        </Button>
      </div>
    )
  }

  // ── Loading ──
  if (isLoading || (isFetching && !post)) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-b from-muted/20 to-background">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <Skeleton className="mb-8 h-5 w-32" />
          <Skeleton className="mb-4 h-10 w-full md:h-14 md:w-3/4" />
          <Skeleton className="mb-4 h-5 w-3/4 md:w-1/2" />
          <div className="mb-10 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>
          <Skeleton className="aspect-[21/9] w-full rounded-3xl" />
          <div className="mt-12 space-y-5">
            <Skeleton className="h-7 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="mt-8 h-7 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  // ── Error / Not found ──
  if (isError || !post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("blog.notFound")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("blog.notFoundMessage")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              {t("blog.retry")}
            </Button>
            <Button asChild>
              <Link href="/blog">{t("blog.allArticles")}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Success ──
  const title = post.title?.trim() || t("blog.untitled")
  const cover = post.cover_image || "/logo.svg"
  const authorName = post.author_name || t("blog.team")
  const authorPhoto = resolveAuthorAvatar(post.author_avatar)
  const authorInitials = authorName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const readLabel = formatReadTime(post.reading_time_minutes)
  const dateLabel = formatBlogDate(post.published_at)

  return (
    <article className="min-h-screen bg-gradient-to-b from-muted/20 to-background pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Migas de pan">
            <Link href="/blog" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              {t("blog.breadcrumb")}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
            <span className="line-clamp-1 font-medium text-foreground">{title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-10 md:pt-16">
        {/* Category + share row */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {post.category ? (
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-medium">
                {post.category}
              </Badge>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            aria-label={t("blog.share")}
            type="button"
            onClick={() => {
              const url = window.location.href
              if (navigator.share) {
                navigator.share({ title, url })
              } else {
                navigator.clipboard.writeText(url)
              }
            }}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-[1.1]">
          {title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            {post.excerpt}
          </p>
        )}

        {/* Author + Date row */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-border/50 py-6">
          <div className="flex items-center gap-3">
            {authorPhoto ? (
              <Image
                src={authorPhoto}
                alt=""
                width={48}
                height={48}
                className="rounded-full object-cover ring-2 ring-border/40"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary" aria-hidden>
                {authorInitials || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{authorName}</p>
              <p className="text-xs text-muted-foreground">{t("blog.author")}</p>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <span className="font-medium text-foreground">{readLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
              <time className="font-medium text-foreground" dateTime={post.published_at || undefined}>
                {dateLabel || "—"}
              </time>
            </span>
          </div>
        </div>

        {/* Cover image */}
        <div className="relative mt-10 overflow-hidden rounded-3xl bg-muted shadow-2xl ring-1 ring-border/30">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={cover}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>

        {/* Content — sections */}
        <div className="mt-14 md:mt-20">
          {post.content_html ? (
            <div
              className="prose prose-invert max-w-none break-words prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          ) : (
            <BlogBody sections={post.content || []} />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-border/50 pt-10">
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              {t("blog.backToBlog")}
            </Link>
          </Button>
        </footer>
      </div>
    </article>
  )
}
