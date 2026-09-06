import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoBanner from "@/components/home/PromoBanner";
import NewArrivals from "@/components/home/NewArrivals";
import CouponSection from "@/components/home/CouponSection";
import TopDeals from "@/components/home/TopDeals";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />

      <CategoriesSection />

      <FeaturedProducts />

      <PromoBanner />

      <NewArrivals />

      <CouponSection />

      <TopDeals />

      <Footer />
    </main>
  );
}