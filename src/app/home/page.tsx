"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import type { IProduct } from "@/types/product";
import SearchSection from "@/components/sections/search-section";
import { isProductType } from "@/utils";

function HomeContent() {
  // Filtro de categoría vía ?type=tours|rental (enlazado desde el footer).
  // Se aplica en el cliente con el mismo helper isProductType usado en el
  // resto de la app, en vez de un parámetro del backend sin verificar.
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type");

  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldFetchMore, setShouldFetchMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);

  const { data: initialProductsData, isLoading: isLoadingInitial } =
    useGetProductsQuery(
      { limit: 20, is_approved: true, is_active: true },
      {
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

  const {
    data: moreProductsData,
    isLoading: isLoadingMoreQuery,
    isFetching: isFetchingMore,
  } = useGetProductsQuery(
    {
      limit: 8,
      cursor: nextCursor || undefined,
      is_approved: true,
      is_active: true,
    },
    {
      skip: !shouldFetchMore || !nextCursor,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  const applyTypeFilter = (products: IProduct[]) =>
    typeFilter ? products.filter((p) => isProductType(p, typeFilter)) : products;

  useEffect(() => {
    if (initialProductsData && allProducts.length === 0) {
      const validData = Array.isArray(initialProductsData.data)
        ? initialProductsData.data
        : [];
      setAllProducts(validData);
      setSearchResults(applyTypeFilter(validData));
      setNextCursor(initialProductsData.pagination.nextCursor);
      setHasMoreProducts(initialProductsData.pagination.hasMore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProductsData, allProducts.length, typeFilter]);

  useEffect(() => {
    if (
      shouldFetchMore &&
      moreProductsData &&
      !isLoadingMoreQuery &&
      !isFetchingMore
    ) {
      setAllProducts((prev) => [...prev, ...moreProductsData.data]);
      setSearchResults((prev) => [...prev, ...applyTypeFilter(moreProductsData.data)]);
      setNextCursor(moreProductsData.pagination.nextCursor);
      setHasMoreProducts(moreProductsData.pagination.hasMore);
      setShouldFetchMore(false);
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchMore, moreProductsData, isLoadingMoreQuery, isFetchingMore]);

  const loadMoreProducts = () => {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    setShouldFetchMore(true);
  };

  // Memoizado: SearchSection dispara un efecto cada vez que esta referencia
  // cambia. Sin useCallback, applyTypeFilter generaba un array nuevo en cada
  // render (por el .filter()), lo que rompía el bail-out de React y producía
  // un loop infinito de renders cuando había un ?type= activo.
  const handleSearchResults = useCallback(
    (results: IProduct[]) => {
      const validResults = Array.isArray(results) ? results : [];
      setSearchResults(applyTypeFilter(validResults));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typeFilter]
  );

  const handleSearchLoading = (loading: boolean) => {
    setIsSearching(loading);
  };

  return (
    <>
      <UpTop />
      <SearchSection
        products={allProducts}
        onSearchResults={handleSearchResults}
        onSearchLoading={handleSearchLoading}
      />
      <TourSection
        products={searchResults}
        isLoading={isLoadingInitial || isSearching}
        onLoadMore={loadMoreProducts}
        hasMore={hasMoreProducts}
        isLoadingMore={isLoadingMore}
      />
      {/* <PopularDestinations /> */}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
