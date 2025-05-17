"use client";
import { useState, useEffect } from "react";
import HeroSection from "@/components/sections/hero-section";
import PopularDestinations from "@/components/sections/popular-destination";
import SearchSection from "@/components/sections/search-section";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import { RootState, useAppSelector } from "@/redux/store";
import { IProduct } from "@/types/product";

export default function Home() {
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldFetchMore, setShouldFetchMore] = useState(false);

  // Consulta inicial sin cursor
  const { data: initialProductsData, isLoading: isLoadingInitial } =
    useGetProductsQuery(
      { limit: 4 },
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
      setAllProducts(initialProductsData.data);
      setNextCursor(initialProductsData.pagination.nextCursor);
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

  const { rating, pricing, productType } = useAppSelector(
    (state: RootState) => state.filters
  );

  const ratingNumber = Number(rating);
  const pricingNumber = Number(pricing);

  // Filtrar productos
  const filteredProducts = allProducts.filter((product) => {
    const productRating = Number(product.average_rating);
    const productPrice = Number(product.price);
    const productTypeName = product.product_type?.name || "";

    const meetsRating = isNaN(ratingNumber) || productRating >= ratingNumber;
    const meetsPricing = isNaN(pricingNumber) || productPrice <= pricingNumber;
    const meetsProductType =
      !productType || productType === "all" || productTypeName === productType;

    return meetsRating && meetsPricing && meetsProductType;
  });

  // Determinar si hay más productos para cargar
  const hasMore =
    initialProductsData?.pagination.hasMore ||
    (moreProductsData?.pagination.hasMore ?? false);

  return (
    <>
      <UpTop />
      <HeroSection />
      <SearchSection products={filteredProducts} />
      <TourSection
        products={filteredProducts}
        isLoading={isLoadingInitial}
        onLoadMore={loadMoreProducts}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
      <PopularDestinations />
    </>
  );
}
