import { Inter } from "next/font/google";
import GlobalProviders from "../components/providers/global-providers";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "dantour - Your Travel Companion",
  description: "Discover amazing destinations and book your next adventure",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      afterSignOutUrl={"/"}
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} h-full flex flex-col`}>
          <GlobalProviders>{children}</GlobalProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
