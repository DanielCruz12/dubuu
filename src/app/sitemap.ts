import type { MetadataRoute } from "next";

// Esta función simula la obtención de datos de tu base de datos
// Reemplázala con tu lógica real para obtener tours, propiedades, etc.
async function fetchBlogPosts() {
  // Ejemplo: return await db.blogPosts.findMany();
  return [
    { slug: "mejores-destinos-el-salvador", updatedAt: new Date() },
    { slug: "guia-playas-centroamerica", updatedAt: new Date() },
    { slug: "tours-volcanicos", updatedAt: new Date() },
  ];
}

async function fetchRentals() {
  // Ejemplo: return await db.rentals.findMany();
  return [
    { slug: "suv-4x4", updatedAt: new Date() },
    { slug: "sedan-economico", updatedAt: new Date() },
    { slug: "minivan", updatedAt: new Date() },
  ];
}

async function fetchInvestments() {
  // Ejemplo: return await db.investments.findMany();
  return [
    { slug: "propiedad-playa-el-tunco", updatedAt: new Date() },
    { slug: "villa-lago-coatepeque", updatedAt: new Date() },
    { slug: "apartamento-san-salvador", updatedAt: new Date() },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Obtener datos dinámicos
  const blogPosts = await fetchBlogPosts();
  const rentals = await fetchRentals();
  const investments = await fetchInvestments();

  // Páginas estáticas principales basadas en tu estructura de archivos
  const staticPages = [
    {
      url: "https://www.dubuu.com",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: "https://www.dubuu.com/home",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: "https://www.dubuu.com/rental",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: "https://www.dubuu.com/investment",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://www.dubuu.com/map",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: "https://www.dubuu.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://www.dubuu.com/contact",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: "https://www.dubuu.com/support",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: "https://www.dubuu.com/terms",
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ];

  // Mapear entradas de blog a entradas de sitemap
  const blogEntries = blogPosts.map((post) => ({
    url: `https://www.dubuu.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Mapear alquileres a entradas de sitemap
  const rentalEntries = rentals.map((rental) => ({
    url: `https://www.dubuu.com/rental/${rental.slug}`,
    lastModified: rental.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Mapear inversiones a entradas de sitemap
  const investmentEntries = investments.map((investment) => ({
    url: `https://www.dubuu.com/investment/${investment.slug}`,
    lastModified: investment.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Combinar todas las entradas
  return [
    ...staticPages,
    ...blogEntries,
    ...rentalEntries,
    ...investmentEntries,
  ];
}
