"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { IBlogSection } from "@/types/blog"

interface BlogBodyProps {
  sections: IBlogSection[]
  className?: string
}

export function BlogBody({ sections, className }: BlogBodyProps) {
  if (!sections || sections.length === 0) {
    return (
      <p className="italic text-muted-foreground">
        Este artículo no tiene contenido todavía.
      </p>
    )
  }

  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className={cn("space-y-16", className)}>
      {sorted.map((section, idx) => {
        const imgs = (section.images || []).filter(Boolean)
        const vids = (section.videos || []).filter(Boolean)

        return (
          <section key={idx} className="group">
            {/* Section title */}
            {section.title && (
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {section.title}
              </h2>
            )}

            {/* Images interleaved before content */}
            {imgs.length > 0 && (
              <div
                className={cn(
                  "mb-8 grid gap-4",
                  imgs.length === 1
                    ? "grid-cols-1"
                    : imgs.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {imgs.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative overflow-hidden rounded-2xl bg-muted shadow-md ring-1 ring-border/30 transition-all duration-300 group-hover:shadow-lg",
                      imgs.length === 1 ? "aspect-[16/9] sm:aspect-[21/9]" : "aspect-[4/3]",
                    )}
                  >
                    <Image
                      src={img}
                      alt={section.title || `Imagen ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes={
                        imgs.length === 1
                          ? "(max-width: 768px) 100vw, 768px"
                          : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      }
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Section content */}
            {section.content && (
              <div className="prose prose-lg max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
                {section.content.split("\n\n").map((paragraph, pi) => (
                  <p key={pi} className="whitespace-pre-wrap text-base leading-[1.8] text-foreground/90 md:text-lg break-words">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Videos */}
            {vids.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {vids.map((vid, vi) => {
                  let embedUrl = vid
                  if (vid.includes("youtube.com/watch?v=")) {
                    embedUrl = vid.replace("watch?v=", "embed/")
                  } else if (vid.includes("youtu.be/")) {
                    embedUrl = vid.replace("youtu.be/", "youtube.com/embed/")
                  }

                  if (embedUrl !== vid || vid.includes("vimeo.com")) {
                    return (
                      <div key={vi} className="relative aspect-video overflow-hidden rounded-2xl bg-muted shadow-md ring-1 ring-border/30">
                        <iframe
                          src={embedUrl}
                          className="absolute inset-0 h-full w-full"
                          allowFullScreen
                          title={section.title || `Video ${vi + 1}`}
                        />
                      </div>
                    )
                  }

                  return (
                    <div key={vi} className="relative aspect-video overflow-hidden rounded-2xl bg-muted shadow-md ring-1 ring-border/30">
                      <video
                        controls
                        src={vid}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Divider between sections */}
            {idx < sorted.length - 1 && (
              <hr className="mt-16 border-border/40" />
            )}
          </section>
        )
      })}
    </div>
  )
}
