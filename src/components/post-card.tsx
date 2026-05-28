import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

interface PostCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    avatar?: string;
  };
  className?: string;
}

export function PostCard({
  title,
  excerpt,
  category,
  date,
  readTime,
  image,
  author,
  className,
}: PostCardProps) {
  const { t } = useLanguage();
  const initials = author.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl lg:flex-row",
        className,
      )}
    >
      {/* IMAGE */}
      <div className="relative shrink-0 lg:w-[30%]">
        <div className="relative h-[170px] w-full overflow-hidden sm:h-[190px] lg:h-full">
          <Image
            src={image || "/logo.svg"}
            alt={title}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 36vw"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>

        {category ? (
          <Badge
            variant="outline"
            className="absolute left-4 top-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 backdrop-blur-md"
          >
            {category}
          </Badge>
        ) : null}
      </div>

      {/* CONTENT */}
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5 lg:p-8">
        {/* AUTHOR */}
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-white/10">
            {author.avatar ? (
              <AvatarImage src={author.avatar} alt={author.name} />
            ) : null}

            <AvatarFallback className="bg-white/10 text-xs font-semibold ">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium ">{author.name}</p>

            <time className="text-xs text-zinc-500">{date}</time>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="mb-3 line-clamp-2 break-words text-base font-semibold leading-snug tracking-tight  transition-colors duration-300 group-hover:text-zinc-100 sm:text-lg lg:text-2xl">
          {title}
        </h2>

        {/* EXCERPT */}
        {excerpt ? (
          <p className="mb-5 line-clamp-3 break-words text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
            {excerpt}
          </p>
        ) : (
          <div className="mb-5" />
        )}

        {/* FOOTER */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="text-xs text-zinc-500 sm:text-sm">{readTime}</span>

          <span className="inline-flex items-center gap-1 text-sm font-medium  transition-transform duration-300 group-hover:translate-x-1">
            {t("blog.readArticle")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
