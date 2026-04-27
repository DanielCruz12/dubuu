"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import Image from "next/image";
import { BlogBody } from "@/components/blog/blog-body";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBlogPostQuery } from "@/redux/slices/blog/blog-slice";
import {
  formatBlogDate,
  formatReadTime,
  resolveAuthorAvatar,
} from "@/utils/blog-display";

export function BlogPostView({ id }: { id: string }) {
  const { data: post, isLoading, isError, isFetching, refetch } =
    useGetBlogPostQuery(id, { skip: !id });

  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Enlace no válido.</p>
        <Button asChild variant="secondary">
          <Link href="/blog">Volver al blog</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || (isFetching && !post)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <Skeleton className="mb-6 h-4 w-48" />
        <Skeleton className="mb-4 h-12 w-full max-w-2xl" />
        <Skeleton className="mb-10 h-4 w-2/3" />
        <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
        <div className="mt-10 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Artículo no encontrado
        </h1>
        <p className="mt-2 text-muted-foreground">
          Puede que se haya eliminado o el enlace sea incorrecto.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
          <Button asChild variant="secondary">
            <Link href="/blog">Todos los artículos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = post.title?.trim() || "Sin título";
  const cover = post.cover_image || "/logo.svg";
  const authorName = post.author_name || "Equipo Dubuu";
  const authorPhoto = resolveAuthorAvatar(post.author_avatar);
  const authorInitials = authorName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const readLabel = formatReadTime(post.reading_time_minutes);
  const dateLabel = formatBlogDate(post.published_at);

  return (
    <article className="min-h-[70vh] pb-20">
      <div className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
          <nav
            className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
            aria-label="Migas de pan"
          >
            <Link
              href="/blog"
              className="transition hover:text-foreground"
            >
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
            <span className="line-clamp-1 font-medium text-foreground">
              {title}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-10 md:pt-14">
        {post.category ? (
          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>
        ) : null}

        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {title}
        </h1>

        {post.excerpt ? (
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground md:text-xl">
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-border/70 py-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            {authorPhoto ? (
              <Image
                src={authorPhoto}
                alt=""
                width={44}
                height={44}
                className="rounded-full object-cover ring-2 ring-background"
              />
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                aria-hidden
              >
                {authorInitials || "?"}
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{authorName}</p>
              <p className="text-xs text-muted-foreground">Autor</p>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
              <span className="text-foreground">{readLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar
                className="h-4 w-4 shrink-0 text-primary/80"
                aria-hidden
              />
              <time
                className="text-foreground"
                dateTime={post.published_at || undefined}
              >
                {dateLabel || "—"}
              </time>
            </span>
          </div>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-border/40">
          <div className="relative aspect-[2/1] w-full md:aspect-[21/9]">
            <Image
              src={cover}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
        </div>

        <div className="mt-12 md:mt-14">
          <BlogBody content={post.content} />
        </div>

        <footer className="mt-16 flex flex-wrap justify-between gap-4 border-t border-border/70 pt-10">
          <Button asChild variant="outline">
            <Link href="/blog">← Volver al blog</Link>
          </Button>
        </footer>
      </div>
    </article>
  );
}
