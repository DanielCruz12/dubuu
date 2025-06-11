"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecentPosts() {
  const pathname = usePathname();

  return (
    <div className="px-5 md:px-20 pb-20">
      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div>
          <div className="mb-8">
            <h1 className="text-xl md:text-4xl font-semibold">Recent Posts</h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Favorite destinations based on customer reviews
            </p>
          </div>
        {/*   <div className="grid gap-8">
            {pathname === "/blog"
              ? posts.map((post, index) => (
                  <Link key={index} href={`/blog/${post.id}`}>
                    <PostCard {...post} />
                  </Link>
                ))
              : posts.slice(0, 1).map((post, index) => (
                  <Link key={index} href={`/blog/${post.id}`}>
                    <PostCard {...post} />
                  </Link>
                ))}
          </div> */}
        </div>

        {/* Sidebar */}
       {/*  <aside className="md:mt-20">
          <h2 className="mb-6 pt-4 text-xl font-semibold">Trending Now</h2>
          <div className="grid gap-6">
            {trendingPosts.slice(0, 2).map((post, index) => (
              <TrendingPost key={index} {...post} updateDate={post.date} />
            ))}
          </div>
        </aside> */}
      </div>
      {pathname === "/" && (
        <div className="mt-8 text-center">
          <Link href="/blog">
            <Button variant={"secondary"}>See All Posts</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
