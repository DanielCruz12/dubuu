"use client";
import { useState, useEffect } from "react";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import type { IProduct } from "@/types/product";
import SearchSection from "@/components/sections/search-section";

export default function Home() {
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

  useEffect(() => {
    if (initialProductsData && allProducts.length === 0) {
      const validData = Array.isArray(initialProductsData.data)
        ? initialProductsData.data
        : [];
      setAllProducts(validData);
      setSearchResults(validData);
      setNextCursor(initialProductsData.pagination.nextCursor);
      setHasMoreProducts(initialProductsData.pagination.hasMore);
    }
  }, [initialProductsData, allProducts.length]);

  useEffect(() => {
    if (
      shouldFetchMore &&
      moreProductsData &&
      !isLoadingMoreQuery &&
      !isFetchingMore
    ) {
      setAllProducts((prev) => [...prev, ...moreProductsData.data]);
      setSearchResults((prev) => [...prev, ...moreProductsData.data]);
      setNextCursor(moreProductsData.pagination.nextCursor);
      setHasMoreProducts(moreProductsData.pagination.hasMore);
      setShouldFetchMore(false);
      setIsLoadingMore(false);
    }
  }, [shouldFetchMore, moreProductsData, isLoadingMoreQuery, isFetchingMore]);

  const loadMoreProducts = () => {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    setShouldFetchMore(true);
  };

  const handleSearchResults = (results: IProduct[]) => {
    const validResults = Array.isArray(results) ? results : [];
    setSearchResults(validResults);
  };

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
