"use client";
import { useState, useEffect } from "react";
import HeroSection from "@/components/sections/hero-section";
import PopularDestinations from "@/components/sections/popular-destination";
import SearchSection from "@/components/sections/search-section";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import type { IProduct } from "@/types/product";

export default function Home() {
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Consulta inicial sin cursor
  const { data: initialProductsData, isLoading: isLoadingInitial } =
    useGetProductsQuery(
      { limit: 4, is_approved: true },

      {
        // Evitar refetch automático
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  // Consulta para cargar más productos (solo se activa cuando shouldFetchMore es true)
  const {
    data: moreProductsData,
    isLoading: isLoadingMoreQuery,
    isFetching: isFetchingMore,
  } = useGetProductsQuery(
    {
      limit: 8,
      cursor: nextCursor || undefined,
      is_approved: true,
    },
    {
      // Solo ejecutar cuando shouldFetchMore es true y nextCursor existe
      skip: !shouldFetchMore || !nextCursor,
      // Evitar refetch automático
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  // Cargar datos iniciales
  useEffect(() => {
    if (initialProductsData && allProducts.length === 0) {
      const validData = Array.isArray(initialProductsData.data)
        ? initialProductsData.data
        : [];
      setAllProducts(validData);
      setNextCursor(initialProductsData.pagination.nextCursor);
      // Inicializar searchResults con todos los productos
      setSearchResults(validData);
    }
  }, [initialProductsData, allProducts.length]);

  // Manejar la carga de más productos
  useEffect(() => {
    if (
      shouldFetchMore &&
      moreProductsData &&
      !isLoadingMoreQuery &&
      !isFetchingMore
    ) {
      // Añadir los nuevos productos a los existentes
      setAllProducts((prev) => [...prev, ...moreProductsData.data]);
      // Actualizar el cursor para la próxima carga
      setNextCursor(moreProductsData.pagination.nextCursor);
      // Resetear el flag para evitar cargas repetidas
      setShouldFetchMore(false);
      setIsLoadingMore(false);
    }
  }, [shouldFetchMore, moreProductsData, isLoadingMoreQuery, isFetchingMore]);

  // Función para cargar más productos
  const loadMoreProducts = () => {
    if (isLoadingMore || !nextCursor) return;

    setIsLoadingMore(true);
    setShouldFetchMore(true);
  };

  // Manejar resultados de búsqueda desde SearchSection
  const handleSearchResults = (results: IProduct[]) => {
    // Asegurar que results sea siempre un array válido
    const validResults = Array.isArray(results) ? results : [];
    setSearchResults(validResults);
  };

  // Manejar estado de búsqueda
  const handleSearchLoading = (loading: boolean) => {
    setIsSearching(loading);
  };

  // Determinar si hay más productos para cargar
  const hasMore =
    initialProductsData?.pagination.hasMore ||
    (moreProductsData?.pagination.hasMore ?? false);

  return (
    <>
      <UpTop />
      <HeroSection />
      <SearchSection
        products={allProducts}
        onSearchResults={handleSearchResults}
        onSearchLoading={handleSearchLoading}
      />
      <TourSection
        products={searchResults}
        isLoading={isLoadingInitial || isSearching}
        onLoadMore={loadMoreProducts}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
      <PopularDestinations />
    </>
  );
}
