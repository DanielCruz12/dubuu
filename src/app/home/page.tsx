"use client";
import HeroSection from "@/components/sections/hero-section";
import PopularDestinations from "@/components/sections/popular-destination";
import SearchSection from "@/components/sections/search-section";
import TourSection from "@/components/sections/tour-section";
import UpTop from "@/components/up-top";
import { useGetProductsQuery } from "@/redux/slices/product/product-slice";
import { RootState, useAppSelector } from "@/redux/store";

export default function Home() {
  const { data: products = { data: [], pagination: {} }, isLoading } =
    useGetProductsQuery({
      sort: "createdAt",
      order: "desc",
    });
  const { rating, pricing, productType } = useAppSelector(
    (state: RootState) => state.filters
  );

  const ratingNumber = Number(rating);
  const pricingNumber = Number(pricing);

  const filteredProducts = products.data.filter((product) => {
    const productRating = Number(product.average_rating);
    const productPrice = Number(product.price);
    const productTypeName = product.product_type?.name || "";

    const meetsRating = isNaN(ratingNumber) || productRating >= ratingNumber;
    const meetsPricing = isNaN(pricingNumber) || productPrice <= pricingNumber;
    const meetsProductType =
      !productType || productType === "all" || productTypeName === productType;

    return meetsRating && meetsPricing && meetsProductType;
  });

  return (
    <>
      <UpTop />
      <HeroSection />
      <SearchSection products={filteredProducts} />
      <TourSection products={filteredProducts} isLoading={isLoading} />
      <PopularDestinations />
    </>
  );
}
