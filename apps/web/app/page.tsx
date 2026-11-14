import Events from "@/components/events/Events";
import BeginnerGuideCarousel from "@/components/home/BeginnerGuideCarousel";
import Hero from "@/components/home/Hero";
import ShopByCategory from "@/components/home/ShopByCategory";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import Newsletter from "@/components/shared/Newsletter";
import WhyHotLap from "@/components/shared/WhyHotLap";

export default function HomePage() {
  return (
    <>
      <Hero />

      <ShopByCategory />

      <FeaturedProducts />

      <BeginnerGuideCarousel />

      <WhyHotLap />

      <Events />

      <Newsletter />
    </>
  );
}
