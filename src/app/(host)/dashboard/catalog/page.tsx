import { Metadata } from "next";
import { CatalogContent } from "./(components)/catalog-content";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Administra los recursos del sistema",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CatalogPage() {
  return <CatalogContent />;
}
