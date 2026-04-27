import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
  const initials = author.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300",
        "hover:border-primary/25 hover:shadow-md md:flex-row md:items-stretch",
        className,
      )}
    >
      <div className="relative shrink-0 md:w-[min(42%,320px)] md:min-w-[240px]">
        <div className="relative aspect-[16/10] w-full md:h-full md:min-h-[220px]">
          <Image
            src={image || "/logo.svg"}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-80 md:bg-gradient-to-r md:from-black/20 md:to-transparent" />
        </div>
        <Badge
          variant="secondary"
          className="absolute left-4 top-4 border-0 bg-background/90 text-foreground shadow-sm backdrop-blur-sm"
        >
          {category}
        </Badge>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-6 md:p-8">
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/80">
            {author.avatar ? (
              <AvatarImage src={author.avatar} alt="" />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium text-foreground">
              {author.name}
            </p>
            <time className="text-muted-foreground">{date}</time>
          </div>
        </div>

        <h2 className="mb-2 text-xl font-semibold leading-snug tracking-tight text-foreground md:text-2xl line-clamp-2">
          {title}
        </h2>
        {excerpt ? (
          <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:line-clamp-3 md:text-base">
            {excerpt}
          </p>
        ) : (
          <div className="mb-5" />
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <span className="text-sm text-muted-foreground">{readTime}</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary transition group-hover:gap-2">
            Leer artículo
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
