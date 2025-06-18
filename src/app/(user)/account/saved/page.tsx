import { SavedProducts } from "@/components/sections/wish-list/wish-list";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Productos Guardados",
  description:
    "Revisa los productos que has guardado para comprarlos más tarde.",
};

const SavedPage = () => {
  return (
    <SavedProducts
      heading="Guardados"
      description="Vuelve a ver los productos que guardaste anteriormente"
      emptyStateMessage="No tienes productos guardados"
      exploreLink="/home"
      exploreLinkText="Explorar productos"
    />
  );
};

export default SavedPage;
