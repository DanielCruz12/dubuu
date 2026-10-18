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
import { SocketProvider } from "@/contexts/socket-context";
import { ClerkLocalizedProvider } from "./clerk-localized-provider";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import NotificationsAutoEnabler from "@/components/notifications-auto-enabler";
import NotificationsConsentModal from "@/components/notifications-consent-modal";

const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageProvider>
      <ClerkLocalizedProvider>
        <StoreProvider>
          <AuthProvider>
            <SocketProvider>
              <ThemeProvider attribute="class" defaultTheme="light">
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
                <CookieConsentBanner />
                <NotificationsAutoEnabler />
                <NotificationsConsentModal />
              </ThemeProvider>
            </SocketProvider>
          </AuthProvider>
        </StoreProvider>
      </ClerkLocalizedProvider>
    </LanguageProvider>
  );
};

export default GlobalProviders;
