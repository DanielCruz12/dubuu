import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/lib/i18n-context"

interface TrendingPostProps {
  title: string
  publishedDate: string
  updatedDate?: string
  image: string
  href: string
}

export function TrendingPost({
  title,
  publishedDate,
  updatedDate,
  image,
  href,
}: TrendingPostProps) {
  const { t } = useLanguage();
  const showUpdated =
    updatedDate &&
    publishedDate &&
    updatedDate.trim() !== publishedDate.trim()

  return (
    <Link
      href={href}
      className="flex overflow-hidden rounded-xl border border-border/70 bg-card"
    >
      <div className="relative aspect-[4/3] w-[38%] shrink-0">
        <Image
          src={image || "/logo.svg"}
          alt=""
          fill
          className="object-cover"
          sizes="130px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {title}
        </h3>
        <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
          <time>{publishedDate}</time>
          {showUpdated ? (
            <span>{t("blog.updated")} · <time>{updatedDate}</time></span>
          ) : null}
        </div>
        <div className="mt-auto pt-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            {t("blog.read")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  )
}
