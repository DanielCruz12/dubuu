import HeroSection from "@/components/hero-section";
import SearchSection from "@/components/search-section";
import TourSection from "@/components/tour-section";
import UpTop from "@/components/up-top";

export default function Home() {
  return (
    <div className="mx-auto px-3 max-w-7xl">
      <UpTop />
      <SearchSection />
      <HeroSection />
      <TourSection />

      {/* 
      <PopularDestinations /> 
     <TestimonialsSection />
      <RecentPosts />
      {/* <NewsletterSection /> */}
    </div>
  );
}
