"use client";

import type React from "react";

import StoreProvider from "@/redux/store";
import { ThemeProvider } from "next-themes";
import Footer from "@/layouts/footer";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Header } from "@/layouts/header";
import { AuthProvider } from "./auth-provider";
import { LanguageProvider } from "@/lib/i18n-context";
import NextTopLoader from "nextjs-toploader";

const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="white">
            <NextTopLoader />

          <div className="flex flex-col min-h-screen">
            <div className="max-w-[2000px] mx-auto w-full">
              <Header />
              <main className="flex-1">
                <section className="h-full">{children}</section>
              </main>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </LanguageProvider>
      </AuthProvider>
    </StoreProvider>
  );
};

export default GlobalProviders;
