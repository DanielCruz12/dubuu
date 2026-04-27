import Image from "next/image";
import Link from "next/link";

interface TrendingPostProps {
  title: string;
  /** Fecha de publicación (texto ya formateado). */
  publishedDate: string;
  /** Si existe y es distinta de `publishedDate`, se muestra como “Actualizado”. */
  updatedDate?: string;
  image: string;
  href: string;
}

export default function TrendingPostDemo() {
  const post = {
    title: "How to get better agents in New York, USA",
    publishedDate: "18 Sep 2024",
    updatedDate: "12 January 2024",
    image: "/logo.svg?height=80&width=80",
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl">
      <h2 className="mb-6 text-xl font-semibold">Trending Post Example</h2>
      <TrendingPost {...post} href="/blog/example" />
    </div>
  );
}

export function TrendingPost({
  title,
  publishedDate,
  updatedDate,
  image,
  href,
}: TrendingPostProps) {
  const showUpdated =
    updatedDate &&
    publishedDate &&
    updatedDate.trim() !== publishedDate.trim();

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-xl border border-transparent p-2 -m-2 transition-colors hover:border-border/80 hover:bg-muted/40"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60">
        <Image
          src={image || "/logo.svg"}
          alt=""
          width={80}
          height={80}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="line-clamp-2 font-medium leading-snug text-foreground transition-colors hover:text-primary">
          {title}
        </h3>
        <div className="mt-1.5 flex flex-col gap-0.5 text-sm text-muted-foreground">
          <time>{publishedDate}</time>
          {showUpdated ? (
            <span className="text-xs">
              Actualizado · <time>{updatedDate}</time>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
