"use client";
import StoreProvider from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/layouts/header";
import Footer from "@/layouts/footer";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <ClerkProvider
        afterSignOutUrl={"/"}
        appearance={{
          layout: {
            socialButtonsPlacement: "bottom",
            socialButtonsVariant: "iconButton",
          },
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </ClerkProvider>
    </StoreProvider>
  );
};

export default GlobalProviders;
