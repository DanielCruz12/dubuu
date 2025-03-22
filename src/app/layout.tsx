import { Inter } from "next/font/google";
import GlobalProviders from "../components/providers/global-providers";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}  w-full h-full flex flex-col`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
