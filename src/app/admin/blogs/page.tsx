"use client";

import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAdminPostsQuery } from "@/redux/slices/blog/blog-slice";
import { useLanguage } from "@/lib/i18n-context";
import { formatBlogDate } from "@/utils/blog-display";
import { BlogDeleteButton } from "./(components)/blog-delete-button";

export default function AdminBlogsPage() {
  const { t } = useLanguage();
  const { data: posts = [], isLoading, isError, refetch } =
    useGetAdminPostsQuery();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("blog.admin.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("blog.admin.subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("blog.admin.newPost")}
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="font-medium text-red-400">{t("blog.loadError")}</p>
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

      {!isLoading && !isError && posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-12 text-center">
          <p className="text-lg font-medium">{t("blog.noPosts")}</p>
          <Button asChild className="mt-4">
            <Link href="/admin/blogs/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("blog.admin.newPost")}
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && !isError && posts.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("blog.admin.tableTitle")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("blog.admin.tableCategory")}
                </TableHead>
                <TableHead>{t("blog.admin.tableStatus")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("blog.admin.tableDate")}
                </TableHead>
                <TableHead className="text-right">
                  {t("blog.admin.tableActions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      {post.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.cover_image}
                          alt=""
                          className="h-10 w-16 shrink-0 rounded-lg border border-border object-cover"
                        />
                      ) : null}
                      <span className="line-clamp-2 min-w-0 font-medium">
                        {post.title || t("blog.untitled")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap md:table-cell">
                    {post.category || "—"}
                  </TableCell>
                  <TableCell>
                    {post.is_published ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      >
                        {t("blog.admin.published")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{t("blog.admin.draft")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell">
                    {formatBlogDate(post.published_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link
                          href={`/admin/blogs/${post.id}`}
                          aria-label={t("blog.admin.editPost")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <BlogDeleteButton
                        postId={post.id}
                        postTitle={post.title || t("blog.untitled")}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
