"use client";

import type React from "react";

import StoreProvider from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/layouts/header";
import Footer from "@/layouts/footer";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <section className="max-w-7xl mx-auto py-6">{children}</section>
          </main>
          <Footer />
        </div>
        <Toaster richColors />
      </ThemeProvider>
    </StoreProvider>
  );
};

export default GlobalProviders;
