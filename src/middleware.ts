import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Bots y scrapers que DEBEN ver el HTML público sin ser redirigidos
const BOT_USER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "WhatsApp",
  "TelegramBot",
  "LinkedInBot",
  "Discordbot",
  "Slackbot",
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Pinterest",
];

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

// Rutas públicas — cualquiera puede acceder sin autenticación
const isPublicRoute = createRouteMatcher([
  "/",
  "/home(.*)",
  "/blog(.*)",
  "/support(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/investment(.*)",
  "/contact(.*)",
  "/terms(.*)",
  "/privacy(.*)",
]);

const isAccountRoute = createRouteMatcher(["/account(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher([
  "/dashboard/users(.*)",
  "/dashboard/settings(.*)",
  "/admin(.*)",
]);
const isHostRoute = createRouteMatcher([
  "/dashboard/bookings(.*)",
  "/dashboard/payments(.*)",
  "/dashboard/products(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const userAgent = req.headers.get("user-agent");

  // Los bots/scrapers pasan directo — no tienen cookies ni sesión
  if (isBot(userAgent)) {
    return NextResponse.next();
  }

  const { userId } = auth();

  // Si la ruta es pública, permitir acceso sin importar auth
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Si no está autenticado y quiere entrar a rutas protegidas
  if (!userId && (isAccountRoute(req) || isDashboardRoute(req))) {
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }

  // Usuario autenticado — control de acceso por rol
  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const roles = (user.publicMetadata.roles as string[]) || ["user"];

      if (
        isAccountRoute(req) &&
        (roles.includes("admin") || roles.includes("host"))
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (
        isDashboardRoute(req) &&
        !roles.includes("admin") &&
        !roles.includes("host")
      ) {
        return NextResponse.redirect(new URL("/account", req.url));
      }

      if (isAdminRoute(req) && !roles.includes("admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (
        isHostRoute(req) &&
        !roles.includes("host") &&
        !roles.includes("admin")
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
