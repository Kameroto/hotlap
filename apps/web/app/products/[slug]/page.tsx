import type { Metadata } from "next";

import { notFound } from "next/navigation";

import AddToCartButton from "@/components/cart/AddToCartButton";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import ProductBadges from "@/components/products/ProductBadges";
import ProductImage from "@/components/products/ProductImage";
import ProductPrice from "@/components/products/ProductPrice";
import ProductRating from "@/components/products/ProductRating";

import {
  getAllProducts,
  getProductBySlug,
} from "@/lib/products";

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product =
    getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description:
      product.shortDescription,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;

  const product =
    getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage =
    product.images[0];

  const isInStock =
    product.stockQuantity > 0;

  return (
    <main>
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="group overflow-hidden rounded-3xl border bg-card">
              <ProductImage
                src={primaryImage?.url}
                alt={
                  primaryImage?.alt ??
                  product.name
                }
                badges={product.badges}
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {product.brand}
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight lg:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5">
                <ProductRating
                  rating={product.rating}
                  reviewCount={
                    product.reviewCount
                  }
                />
              </div>

              <div className="mt-6">
                <ProductPrice
                  price={product.price}
                  compareAtPrice={
                    product.compareAtPrice
                  }
                  currency={
                    product.currency
                  }
                />
              </div>

              <p
                className={`mt-4 text-sm font-semibold ${
                  isInStock
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {isInStock
                  ? `${product.stockQuantity} units available`
                  : "Currently out of stock"}
              </p>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                {product.description}
              </p>

              <AddToCartButton
                productId={product.id}
                productName={product.name}
                stockQuantity={
                  product.stockQuantity
                }
                size="lg"
                className="mt-8 w-full sm:w-auto"
              />

              <div className="mt-10">
                <ProductBadges
                  badges={product.badges}
                />
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-3xl font-bold tracking-tight">
              Product Specifications
            </h2>

            <div className="mt-8 overflow-hidden rounded-2xl border">
              <dl className="divide-y">
                {Object.entries(
                  product.specifications,
                ).map(
                  ([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-2 px-6 py-5 sm:grid-cols-2"
                    >
                      <dt className="font-medium">
                        {label}
                      </dt>

                      <dd className="text-muted-foreground">
                        {value}
                      </dd>
                    </div>
                  ),
                )}
              </dl>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}