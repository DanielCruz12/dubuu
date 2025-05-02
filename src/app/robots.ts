import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/blog/",
        "/contact/",
        "/home/",
        "/investment/",
        "/map/",
        "/rental/",
        "/support/",
        "/terms/",
      ],
      disallow: [
        "/(auth)/", // Proteger rutas de autenticación
        "/(host)/", // Proteger rutas de host
        "/(user)/", // Proteger rutas de usuario
        "/api/",
        "/*?search=", // Evitar indexación de resultados de búsqueda
        "/*?filter=", // Evitar indexación de filtros
        "/*?sort=", // Evitar indexación de ordenamientos
        "/*?page=", // Evitar indexación de paginación
      ],
    },
    sitemap: "https://www.dubuu.com/sitemap.xml",
    host: "https://www.dubuu.com",
  };
}
