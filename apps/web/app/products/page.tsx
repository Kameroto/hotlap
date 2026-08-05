import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductCatalog from "@/components/products/ProductCatalog";
import SectionHeading from "@/components/ui/SectionHeading";
import { getAllProducts } from "@/lib/products";

export default function ProductsPage() {
  const products = getAllProducts();

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            badge="HotLap Store"
            title="Explore All Products"
            subtitle="Browse RC cars, batteries, spare parts, merchandise, and custom 3D printed accessories."
          />

          <ProductCatalog products={products} />
        </Container>
      </Section>
    </main>
  );
}