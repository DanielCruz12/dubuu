"use client";

import type React from "react";

import StoreProvider from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/layouts/footer";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import ClerkTokenProvider from "./auth-provider";
import { Header } from "@/layouts/header";

const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <ClerkTokenProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-1">
              <section className="h-full">{children}</section>
            </main>
            <Footer />
          </div>
          <Toaster richColors />
        </ThemeProvider>
      </ClerkTokenProvider>
    </StoreProvider>
  );
};

export default GlobalProviders;
