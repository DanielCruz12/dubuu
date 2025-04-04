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
  const { data: products = { data: [], pagination: {} }, isLoading } =
    useGetProductsQuery({
      limit: 6,
      page: 1,
      sort: "createdAt",
      order: "desc",
    });
  const { rating, pricing } = useAppSelector(
    (state: RootState) => state.filters
  );

  const ratingNumber = Number(rating);
  const pricingNumber = Number(pricing);

  const filteredProducts = products.data.filter((product) => {
    const productRating = Number(product.average_rating);
    const productPrice = Number(product.price);

    const meetsRating = isNaN(ratingNumber) || productRating >= ratingNumber;
    const meetsPricing = isNaN(pricingNumber) || productPrice <= pricingNumber;

    return meetsRating && meetsPricing;
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
