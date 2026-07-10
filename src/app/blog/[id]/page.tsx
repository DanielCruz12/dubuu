import type { Metadata } from "next";
import { BlogPostView } from "./blog-post-view";

type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    alternates: { canonical: `/blog/${params.id}` },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  return <BlogPostView id={params.id} />;
}
