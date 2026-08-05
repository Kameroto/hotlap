import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductPrice from "@/components/products/ProductPrice";
import ProductRating from "@/components/products/ProductRating";
import ProductBadges from "@/components/products/ProductBadges";
import ProductImage from "@/components/products/ProductImage";
import ProductCard from "@/components/products/ProductCard";
import { products } from "@/data/products";

export default function PlaygroundPage() {
  return (
    <main>
      <Section>
        <Container>
          <h1 className="text-4xl font-bold tracking-tight">
            Component Playground
          </h1>

          <p className="mt-4 text-muted-foreground">
            This page is used to test HotLap UI components during development.
          </p>

          <div className="mt-12 space-y-12">
            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Product Price
              </h2>

              <div className="space-y-4">
                <ProductPrice
                  price={12999}
                  compareAtPrice={14999}
                  currency="INR"
                />

                <ProductPrice price={9999} currency="INR" />
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold">
                Product Rating
              </h2>

              <div className="space-y-4">
                <ProductRating rating={4.8} reviewCount={42} />
                <ProductRating rating={3.2} reviewCount={15} />
              </div>

              <section>
  <h2 className="mb-4 text-2xl font-semibold">
    Product Image
  </h2>

  <div className="group max-w-md overflow-hidden rounded-2xl border">
    <ProductImage
      alt="MJX Hyper Go 14301 RC car"
      badges={["new", "sale"]}
    />
  </div>
</section>

<section>
  <h2 className="mb-6 text-2xl font-semibold">
    Product Cards
  </h2>

  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
    {products.slice(0, 3).map((product) => (
      <ProductCard
        key={product.id}
        product={product}
      />
    ))}
  </div>
</section>

              <section>
  <h2 className="mb-4 text-2xl font-semibold">
    Product Badges
  </h2>

  <ProductBadges
    badges={["new", "featured", "sale", "best-seller"]}
  />
</section>
            </section>
          </div>
        </Container>
      </Section>
    </main>
  );
}