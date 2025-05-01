import { Inter } from "next/font/google";
import GlobalProviders from "../components/providers/global-providers";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "dubuu - Your Travel Companion",
  description: "Discover amazing destinations and book your next adventure",
  keywords: ["Next.js", "Authentication", "User Management"],
  openGraph: {
    title: "Clerk",
    description: "The best user management and authentication platform.",
    url: "https://clerk.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(262, 4%, 45%)",
        },
        layout: {
          socialButtonsPlacement: "bottom",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} flex min-h-screen flex-col`}>
          <GlobalProviders>{children}</GlobalProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
