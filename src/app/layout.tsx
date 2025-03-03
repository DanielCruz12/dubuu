import { Inter } from "next/font/google";
import { Header } from "@/layouts/header";
import Footer from "@/layouts/footer";
import Providers from "./providers";
import "./globals.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

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
      <body className={`${inter.className} w-[100%]`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
