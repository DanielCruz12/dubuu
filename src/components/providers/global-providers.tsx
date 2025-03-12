'use client'
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/layouts/header";
import Footer from "@/layouts/footer";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

const GlobalProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
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
          <main >{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </ClerkProvider>
    </Provider>
  );
};

export default GlobalProviders;
