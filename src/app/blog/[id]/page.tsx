import { BlogPostView } from "./blog-post-view";

type PageProps = { params: { id: string } };

export default function BlogPostPage({ params }: PageProps) {
  return <BlogPostView id={params.id} />;
}
