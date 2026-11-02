"use client";

import { BlogPostForm } from "../(components)/blog-post-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminPostByIdQuery } from "@/redux/slices/blog/blog-slice";
import { useLanguage } from "@/lib/i18n-context";

export default function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const { t } = useLanguage();
  const { data: post, isLoading, isError } = useGetAdminPostByIdQuery(params.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">
        {t("blog.admin.editPost")}
      </h1>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {!isLoading && (isError || !post) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="font-medium text-red-400">{t("blog.notFound")}</p>
        </div>
      )}

      {!isLoading && !isError && post && (
        <BlogPostForm key={post.id} initial={post} />
      )}
    </div>
  );
}
