"use client";

import { BlogPostForm } from "../(components)/blog-post-form";
import { useLanguage } from "@/lib/i18n-context";

export default function NewBlogPostPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">
        {t("blog.admin.newPost")}
      </h1>
      <BlogPostForm />
    </div>
  );
}
