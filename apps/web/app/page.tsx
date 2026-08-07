import Events from "@/components/events/Events";
import BeginnerGuideCarousel from "@/components/home/BeginnerGuideCarousel";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import Newsletter from "@/components/shared/Newsletter";
import WhyHotLap from "@/components/shared/WhyHotLap";

export default function HomePage() {
  return (
    <>
      <Hero />

      <BeginnerGuideCarousel />

      <FeaturedProducts />

      <WhyHotLap />

      <Events />

      <Newsletter />
    </>
  );
}