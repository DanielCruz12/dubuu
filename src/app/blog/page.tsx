"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { TrendingPost } from "@/components/trending-post";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBlogPostsQuery } from "@/redux/slices/blog/blog-slice";
import { formatBlogDate, postToCardProps } from "@/utils/blog-display";

export default function BlogPage() {
  const pathname = usePathname();
  const { data, isLoading, isError, refetch } = useGetBlogPostsQuery({});

  const posts = data?.data ?? [];
  const visiblePosts =
    pathname === "/blog" ? posts : posts.slice(0, 1);
  const sidebarPosts = posts.slice(0, 4);

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-muted/30 to-background pb-24 pt-8 md:pt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
            Blog Dubuu
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Artículos recientes
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Historias, consejos y novedades para sacar más partido a tus
            experiencias de viaje.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr,min(100%,340px)] lg:gap-12">
          <section aria-label="Lista de artículos">
            {isLoading && (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[340px] rounded-2xl" />
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <p className="font-medium text-destructive">
                  No pudimos cargar los artículos.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  type="button"
                  onClick={() => refetch()}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {!isLoading && !isError && visiblePosts.length === 0 && (
              <p className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                Aún no hay publicaciones. Vuelve pronto.
              </p>
            )}

            {!isLoading && !isError && visiblePosts.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2">
                {visiblePosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className={
                      visiblePosts.length === 1 || index === 0
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <PostCard {...postToCardProps(post)} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="lg:pt-2">
            <div className="sticky top-24 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-md">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Destacados
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Entradas que no te puedes perder
              </p>
              <div className="mt-6 space-y-1">
                {!isLoading && !isError && sidebarPosts.length > 0 ? (
                  sidebarPosts.map((post) => {
                    const card = postToCardProps(post);
                    const updatedRaw = post.updated_at || post.published_at;
                    const updatedLabel =
                      updatedRaw && updatedRaw !== post.published_at
                        ? formatBlogDate(updatedRaw)
                        : undefined;
                    return (
                      <TrendingPost
                        key={post.id}
                        title={post.title || "Sin título"}
                        publishedDate={card.date}
                        updatedDate={updatedLabel}
                        image={card.image}
                        href={`/blog/${post.id}`}
                      />
                    );
                  })
                ) : isLoading ? (
                  <div className="space-y-3 pt-2">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>

        {pathname === "/" && (
          <div className="mt-12 text-center">
            <Button asChild variant="secondary" size="lg">
              <Link href="/blog">Ver todos los artículos</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
