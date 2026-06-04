"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Sparkles } from "lucide-react";

import { PostCard } from "@/components/post-card";
import { TrendingPost } from "@/components/trending-post";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetBlogPostsQuery } from "@/redux/slices/blog/blog-slice";
import { formatBlogDate, postToCardProps } from "@/utils/blog-display";
import { useLanguage } from "@/lib/i18n-context";

export default function BlogPage() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data, isLoading, isError, refetch } = useGetBlogPostsQuery({});

  const posts = data?.data ?? [];

  const visiblePosts = pathname === "/blog" ? posts : posts.slice(0, 1);

  const sidebarPosts = [...posts]
    .sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0))
    .slice(0, 2);

  const isBlogPage = pathname === "/blog";

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-24 pt-8 md:pt-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        {isBlogPage && (
          <header className="mb-10 lg:mb-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
              {t("blog.badge")}
            </div>

            <h3 className=" md:text-3xl font-semibold tracking-tight text-xl">
              {t("blog.title")}
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
              {t("blog.subtitle")}
            </p>
          </header>
        )}

        {/* CONTENT */}
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          {/* POSTS */}
          <section aria-label={t("blog.title")} className="min-w-0">
            {/* LOADING */}
            {isLoading && (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-3xl border border-border/50 bg-muted/30 backdrop-blur-sm"
                  >
                    <div className="flex flex-col lg:flex-row">
                      <Skeleton className="h-[220px] w-full lg:w-[36%]" />

                      <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-8">
                        <div className="mb-5 flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />

                          <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>

                        <Skeleton className="mb-3 h-6 w-full" />
                        <Skeleton className="mb-2 h-6 w-[85%]" />

                        <div className="mb-6 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[92%]" />
                        </div>

                        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-5">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR */}
            {isError && (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                <p className="font-medium text-red-400">
                  {t("blog.loadError")}
                </p>

                <Button
                  variant="secondary"
                  className="mt-4"
                  type="button"
                  onClick={() => refetch()}
                >
                  {t("blog.retry")}
                </Button>
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && !isError && visiblePosts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border/50 bg-muted/20 p-12 text-center">
                <Compass className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

                <p className="text-lg font-medium text-foreground">
                  {t("blog.noPosts")}
                </p>

                <p className="mt-1 text-muted-foreground">{t("blog.noPostsSub")}</p>
              </div>
            )}

            {/* POSTS */}
            {!isLoading && !isError && visiblePosts.length > 0 && (
              <div className="grid gap-5 sm:gap-6">
                {visiblePosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="block min-w-0"
                  >
                    <PostCard {...postToCardProps(post)} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* SIDEBAR */}
          {isBlogPage && (
            <aside className="min-w-0 lg:pt-2">
              <div className="rounded-3xl border border-border/50 bg-muted/30 p-5 backdrop-blur-xl lg:sticky lg:top-24">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {t("blog.featured")}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {t("blog.featuredSubtitle")}
                </p>

                <div className="mt-6 space-y-4">
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
                          title={post.title || t("blog.untitled")}
                          publishedDate={card.date}
                          updatedDate={updatedLabel}
                          image={card.image}
                          href={`/blog/${post.id}`}
                        />
                      );
                    })
                  ) : isLoading ? (
                    <div className="space-y-4 pt-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex overflow-hidden rounded-2xl border border-border/50 bg-muted/30"
                        >
                          <Skeleton className="h-[110px] w-[38%] shrink-0 rounded-none" />

                          <div className="flex flex-1 flex-col p-4">
                            <Skeleton className="h-4 w-full" />

                            <Skeleton className="mt-2 h-3 w-20" />

                            <div className="mt-auto pt-4">
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* CTA */}
        {pathname === "/" && (
          <div className="mt-14 text-center">
            <Button asChild variant="secondary" size="lg">
              <Link href="/blog">{t("blog.viewAll")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
