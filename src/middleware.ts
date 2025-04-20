import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/home",
  "/blog",
  "/support",
  "/sign-in",
  "/sign-up",
  "/investment",
  "/contact",
];

// Create matchers for different types of routes
const isAccountRoute = createRouteMatcher(["/account(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

// Create a matcher for admin-only routes
const isAdminRoute = createRouteMatcher([
  "/dashboard/users(.*)",
  "/dashboard/settings(.*)",
  "/admin(.*)",
]);

// Create a matcher for host-only routes
const isHostRoute = createRouteMatcher([
  "/dashboard/bookings(.*)",
  "/dashboard/payments(.*)",
  "/dashboard/products(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = auth();
  const path = req.nextUrl.pathname;

  // Allow access to public routes for everyone
  if (
    publicRoutes.some((route) => path === route || path.startsWith(`${route}/`))
  ) {
    return NextResponse.next();
  }

  // If the user is not authenticated and trying to access a protected route
  if (!userId && (isAccountRoute(req) || isDashboardRoute(req))) {
    //console.log("🔒 Not authenticated, redirecting...");
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }

  // If the user is authenticated, handle role-based access
  if (userId) {
    try {
      // Fetch the user to get their roles from publicMetadata
      const user = await clerkClient.users.getUser(userId);
      const roles = (user.publicMetadata.roles as string[]) || ["user"];

      // Redirect admins and hosts from /account to /dashboard
      if (
        isAccountRoute(req) &&
        (roles.includes("admin") || roles.includes("host"))
      ) {
        // console.log(
        //   "🔄 Admin/Host accessing account route, redirecting to dashboard..."
        // );
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Regular users can only access /account routes, not /dashboard
      if (
        isDashboardRoute(req) &&
        !roles.includes("admin") &&
        !roles.includes("host")
      ) {
        // console.log(
        //   "🚫 Regular user trying to access dashboard, redirecting..."
        // );
        return NextResponse.redirect(new URL("/account", req.url));
      }

      // Check if user is trying to access admin routes without admin role
      if (isAdminRoute(req) && !roles.includes("admin")) {
        //console.log("🚫 Not authorized for admin route, redirecting...");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Check if user is trying to access host routes without host/admin role
      if (
        isHostRoute(req) &&
        !roles.includes("host") &&
        !roles.includes("admin")
      ) {
        //console.log("🚫 Not authorized for host route, redirecting...");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // If there's an error, redirect to a safe route
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
