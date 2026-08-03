import Hero from "@/components/home/Hero";
import WhyHotLap from "@/components/shared/WhyHotLap";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import Events from "@/components/events/Events";
import Newsletter from "@/components/shared/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <WhyHotLap />
      <Events />
      <Newsletter />
    </>
  );
}