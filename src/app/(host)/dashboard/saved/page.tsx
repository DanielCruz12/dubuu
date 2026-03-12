"use client";
import { SavedProducts } from "@/components/sections/wish-list/wish-list";

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
