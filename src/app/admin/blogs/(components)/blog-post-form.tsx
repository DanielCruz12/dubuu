"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BlogEditor } from "@/components/blog/blog-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCreateBlogPostMutation,
  useGetBlogCategoriesQuery,
  useUpdateBlogPostMutation,
} from "@/redux/slices/blog/blog-slice";
import { useLanguage } from "@/lib/i18n-context";
import { htmlToText } from "@/utils/blog-display";
import type { IBlogPost } from "@/types/blog";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const NO_CATEGORY = "__none__";

export function BlogPostForm({ initial }: { initial?: IBlogPost }) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initial?.cover_image ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);
  const [content, setContent] = useState(initial?.content_html ?? "");
  const slugTouched = useRef(!!initial?.slug);

  const { data: categories = [] } = useGetBlogCategoriesQuery();
  const [createPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();
  const isSaving = isCreating || isUpdating;

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched.current) setSlug(slugify(value));
  };

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(initial?.cover_image ?? null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !htmlToText(content)) {
      toast.error(t("blog.admin.requiredError"));
      return;
    }
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim() || slugify(title));
    formData.append("content", content);
    formData.append("locale", language);
    formData.append("is_published", String(isPublished));
    formData.append("is_approved", "true");
    if (categoryId) formData.append("category_id", categoryId);
    if (coverFile) formData.append("cover_image", coverFile);

    try {
      if (isEdit && initial) {
        await updatePost({ id: initial.id, data: formData }).unwrap();
      } else {
        await createPost(formData).unwrap();
      }
      toast.success(t("blog.admin.saved"));
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error al guardar el artículo:", error);
      toast.error(t("blog.admin.saveError"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="blog-title">{t("blog.admin.formTitle")}</Label>
          <Input
            id="blog-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={t("blog.admin.formTitlePlaceholder")}
            maxLength={160}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-slug">{t("blog.admin.formSlug")}</Label>
          <Input
            id="blog-slug"
            value={slug}
            onChange={(e) => {
              slugTouched.current = true;
              setSlug(slugify(e.target.value));
            }}
            placeholder="mi-articulo"
            maxLength={160}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("blog.admin.formCategory")}</Label>
          <Select
            value={categoryId || NO_CATEGORY}
            onValueChange={(v) => setCategoryId(v === NO_CATEGORY ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("blog.admin.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CATEGORY}>
                {t("blog.admin.selectCategory")}
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name || cat.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-cover">{t("blog.admin.formCover")}</Label>
          <div className="flex items-center gap-4">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt=""
                className="h-14 w-24 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : null}
            <Input
              id="blog-cover"
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
        <Switch
          id="blog-published"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
        <Label htmlFor="blog-published" className="cursor-pointer">
          {t("blog.admin.formPublished")}
        </Label>
      </div>

      <div className="space-y-2">
        <Label>{t("blog.admin.formContent")}</Label>
        <BlogEditor value={content} onChange={setContent} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving
            ? t("blog.admin.saving")
            : isEdit
              ? t("blog.admin.saveChanges")
              : t("blog.admin.create")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/blogs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("blog.admin.cancel")}
          </Link>
        </Button>
      </div>
    </form>
  );
}
