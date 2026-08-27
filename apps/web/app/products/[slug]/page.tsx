import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ChevronRight,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import ProductGallery from "@/components/products/ProductGallery";
import ProductFaq from "@/components/products/ProductFaq";
import MobilePurchaseBar from "@/components/products/MobilePurchaseBar";
import ProductPurchasePanel from "@/components/products/ProductPurchasePanel";
import ProductRecommendations from "@/components/products/ProductRecommendations";
import ProductReviews from "@/components/products/ProductReviews";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import RecentlyViewedTracker from "@/components/products/RecentlyViewedTracker";

import {
  findProductBySlug,
  getRelatedProducts,
} from "@/lib/products";

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const product =
    await findProductBySlug(
      slug,
    );

  if (!product) {
    return {
      title:
        "Product Not Found",
    };
  }

  return {
    title:
      product.name,

    description:
      product.shortDescription,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } =
    await params;

  const product =
    await findProductBySlug(
      slug,
    );

  if (!product) {
    notFound();
  }

  const relatedProducts =
    await getRelatedProducts(
      product,
    );

  return (
    <main className="overflow-hidden bg-[#080a0c] pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <RecentlyViewedTracker
        productSlug={
          product.slug
        }
      />

      <section className="relative border-b border-white/8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-[20%] size-[460px] rounded-full bg-primary/[0.035] blur-[140px]" />

          <div className="absolute inset-0 opacity-[0.1] hotlap-grid-background" />
        </div>

        <Container>
          <div className="relative py-6 sm:py-8">
            <nav
              aria-label="Breadcrumb"
              className="hotlap-supporting-text flex flex-wrap items-center gap-1.5 text-muted-foreground"
            >
              <Link
                href="/"
                className="transition-colors hover:text-primary"
              >
                Home
              </Link>

              <ChevronRight className="size-3" />

              <Link
                href="/products"
                className="transition-colors hover:text-primary"
              >
                Products
              </Link>

              <ChevronRight className="size-3" />

              <Link
                href={`/products?category=${product.category.slug}`}
                className="transition-colors hover:text-primary"
              >
                {
                  product.category
                    .name
                }
              </Link>

              <ChevronRight className="size-3" />

              <span className="max-w-[180px] truncate text-foreground sm:max-w-none">
                {product.name}
              </span>
            </nav>
          </div>
        </Container>
      </section>

      <Section className="relative">
        <div className="pointer-events-none absolute top-20 right-[-15%] size-[520px] rounded-full bg-primary/[0.03] blur-[150px]" />

        <Container>
          <div className="relative grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 xl:gap-16">
            <ProductGallery
              productName={
                product.name
              }
              images={
                product.images
              }
              badges={
                product.badges
              }
            />

            <ProductPurchasePanel
              product={
                product
              }
            />
          </div>

          <div className="relative mt-16 border-t border-white/8 pt-14 lg:mt-20 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div>
                <p className="hotlap-kicker">
                  Product Overview
                </p>

                <h2 className="hotlap-heading mt-4 text-3xl text-foreground sm:text-4xl">
                  Built Around the
                  Details.
                </h2>
              </div>

              <div>
                <p className="text-base leading-8 text-muted-foreground">
                  {
                    product.description
                  }
                </p>
              </div>
            </div>

            {Object.keys(
              product.specifications,
            ).length >
              0 && (
              <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-[#101316]">
                <div className="border-b border-white/8 px-5 py-5 sm:px-7">
                  <h2 className="text-lg font-bold tracking-[-0.02em] text-foreground">
                    Technical
                    Specifications
                  </h2>
                </div>

                <dl className="divide-y divide-white/8">
                  {Object.entries(
                    product.specifications,
                  ).map(
                    ([
                      label,
                      value,
                    ]) => (
                      <div
                        key={
                          label
                        }
                        className="grid gap-2 px-5 py-4 sm:grid-cols-[0.7fr_1.3fr] sm:px-7 sm:py-5"
                      >
                        <dt className="text-sm font-semibold capitalize text-foreground">
                          {label
                            .replace(
                              /([a-z])([A-Z])/g,
                              "$1 $2",
                            )
                            .replace(
                              /[-_]/g,
                              " ",
                            )}
                        </dt>

                        <dd className="text-sm text-muted-foreground sm:text-right">
                          {value}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
            )}
          </div>

          <ProductReviews
            ratingAverage={
              product.ratingAverage
            }
            reviewCount={
              product.reviewCount
            }
          />

          <ProductFaq />

          <ProductRecommendations
            eyebrow="Explore More"
            title="Related Products."
            description={`More from ${product.category.name}, supplemented with standout products from the wider HotLap catalogue.`}
            products={
              relatedProducts
            }
          />

          <RecentlyViewedProducts
            currentProductSlug={
              product.slug
            }
          />
        </Container>
      </Section>

      <MobilePurchaseBar
        product={
          product
        }
      />
    </main>
  );
}
