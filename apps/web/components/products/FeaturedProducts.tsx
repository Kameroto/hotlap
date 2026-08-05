import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductCard from "@/components/products/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { getFeaturedProducts } from "@/lib/products";

export default function FeaturedProducts() {
  const featuredProducts = getFeaturedProducts();

  return (
    <Section className="bg-muted/40">
      <Container>
        <SectionHeading
          badge="Featured Products"
          title="Built for Serious RC Enthusiasts"
          subtitle="Explore selected RC cars and accessories designed for performance, durability, and maximum track-day excitement."
        />

        {featuredProducts.length > 0 ? (
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-muted-foreground">
            Featured products will appear here soon.
          </p>
        )}
      </Container>
    </Section>
  );
}