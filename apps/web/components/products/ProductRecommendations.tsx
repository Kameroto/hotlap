import ProductCard from "@/components/products/ProductCard";

import type {
  Product,
} from "@/types/product";

type ProductRecommendationsProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
};

export default function ProductRecommendations({
  eyebrow,
  title,
  description,
  products,
}: ProductRecommendationsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-white/8 pt-14 lg:mt-20 lg:pt-16">
      <div className="max-w-2xl">
        <p className="hotlap-kicker">
          {eyebrow}
        </p>

        <h2 className="hotlap-heading mt-4 text-3xl text-foreground sm:text-4xl">
          {title}
        </h2>

        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map(
          (product) => (
            <ProductCard
              key={
                product.id
              }
              product={
                product
              }
            />
          ),
        )}
      </div>
    </section>
  );
}
