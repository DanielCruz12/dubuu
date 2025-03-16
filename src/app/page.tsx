"use client";
import HeroSection from "@/components/sections/hero-section";
import SearchSection from "@/components/sections/search-section";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import { RootState, useAppSelector } from "@/redux/store";

export default function Home() {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { rating, pricing } = useAppSelector(
    (state: RootState) => state.filters
  );

  const filteredProducts = products.filter((product) => {
    return (
      !rating ||
      (product.average_rating >= Number(rating) &&
        (!pricing || product.price <= pricing))
    );
  });

  return (
    <div className="mx-auto px-3 max-w-7xl">
      <UpTop />
      <HeroSection />
      <SearchSection products={filteredProducts} />
      <TourSection products={filteredProducts} isLoading={isLoading} />

      {/* 
      <PopularDestinations /> 
     <TestimonialsSection />
      <RecentPosts />
      {/* <NewsletterSection /> */}
    </div>
  );
}
