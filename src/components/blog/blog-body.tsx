"use client";

import { cn } from "@/lib/utils";

function looksLikeHtml(content: string): boolean {
  const t = content.trim();
  if (!t) return false;
  return /^<[a-z][\s\S]*>/i.test(t) || /<\/?(p|div|br|article|h[1-6]|ul|ol|li|strong|em|a)\b/i.test(t);
}

interface BlogBodyProps {
  content: string;
  className?: string;
}

/**
 * Contenido del CMS: si parece HTML se renderiza con prose;
 * si no, texto plano con saltos de línea.
 */
export function BlogBody({ content, className }: BlogBodyProps) {
  if (!content.trim()) {
    return (
      <p className="text-muted-foreground italic">
        Este artículo no tiene cuerpo todavía.
      </p>
    );
  }

  if (looksLikeHtml(content)) {
    return (
      <div
        className={cn(
          "prose prose-lg max-w-none dark:prose-invert",
          "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-p:leading-relaxed",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-img:rounded-xl prose-blockquote:border-primary/40",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div
      className={cn(
        "space-y-4 text-base leading-[1.75] text-foreground md:text-lg",
        className,
      )}
    >
      {content.split(/\n\n+/).map((block, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {block}
        </p>
      ))}
    </div>
  );
}
