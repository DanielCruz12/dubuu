"use client";
import HeroSection from "@/components/sections/hero-section";
import PopularDestinations from "@/components/sections/popular-destination";
import SearchSection from "@/components/sections/search-section";
import TestimonialsSection from "@/components/sections/testimonials";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import { RootState, useAppSelector } from "@/redux/store";
import RecentPosts from "./blog/page";
import NewsletterSection from "@/components/sections/newsletter";

export default function Home() {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { rating, pricing, category } = useAppSelector(
    (state: RootState) => state.filters
  );

  const filteredProducts = products.filter((product) => {
    return (
      !rating ||
      (product.average_rating >= Number(rating) &&
        (!pricing || product.price >= pricing) &&
        (!category || product.product_category.name === category))
    );
  });

  return (
    <div>
      <div className="mx-auto px-3 max-w-7xl">
        <UpTop />
        <HeroSection />
        <SearchSection products={filteredProducts} />
        <TourSection products={filteredProducts} isLoading={isLoading} />
        <PopularDestinations />
        <TestimonialsSection />
        <RecentPosts />
      </div>
      <NewsletterSection />
    </div>
  );
}
