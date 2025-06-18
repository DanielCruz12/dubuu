import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/robots.txt`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/favicon.ico`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/apple-touch-icon.png`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/manifest.json`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/opengraph-image.png`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/investment`,
    },
    {
      url: `${baseUrl}/home`,
    },
    {
      url: `${baseUrl}/account/*`,
    },
    {
      url: `${baseUrl}/account/profile`,
    },
    {
      url: `${baseUrl}/account/saved`,
    },
    {
      url: `${baseUrl}/account/bookings`,
    },
  ];

  return routes;
}
