"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { blogData } from "../../../utils/data"; // Import blog data

export default function BlogPost({ params }: { params: { id: string } }) {
  const blog = blogData.find(
    (b: { id: number }) => b.id === parseInt(params.id)
  ); // Find blog post by ID

  if (!blog) {
    return <div>Blog post not found</div>;
  }

  return (
    <article className="px-5 md:px-20 mx-auto ">
      <div className="mb-8 text-center">
        <Badge className="mb-4">{blog.category}</Badge>
        <h1 className="text-2xl md:text-5xl font-bold tracking-tight mb-6">
          {blog.title}
        </h1>
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image
              src={blog.authorImage || "/logo.png"}
              alt={blog.author}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span>{blog.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{blog.readingTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time>
              {new Date(blog.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
        </div>
      </div>

      <div className="relative aspect-[21/7] mb-12 rounded-lg overflow-hidden">
        <Image
          src={blog.imageUrl || "/logo.png"}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="lead">{blog.excerpt}</p>
        <p>{blog.content}</p>
      </div>
    </article>
  );
}
