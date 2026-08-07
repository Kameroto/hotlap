import Link from "next/link";

import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import ProductCard from "@/components/products/ProductCard";

import {
  buttonVariants,
} from "@/components/ui/button";

import SectionHeading from "@/components/ui/SectionHeading";

import {
  getFeaturedProductList,
} from "@/lib/products";

import {
  cn,
} from "@/lib/utils";

export const dynamic =
  "force-dynamic";

export default async function FeaturedProducts() {
  const featuredProducts =
    await getFeaturedProductList(
      6,
    );

  return (
    <Section className="relative overflow-hidden border-b border-white/8 bg-[#080a0c]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-[-15%] size-[520px] rounded-full bg-primary/[0.04] blur-[130px]" />

        <div className="absolute bottom-[-30%] left-[-10%] size-[420px] rounded-full bg-primary/[0.025] blur-[130px]" />
      </div>

      <Container>
        <div className="relative">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              badge="Featured Machines"
              title="Performance Worth a Closer Look"
              subtitle="A curated selection of RC cars, performance equipment, and enthusiast accessories from the HotLap catalogue."
            />

            <Link
              href="/products"
              className={cn(
                buttonVariants({
                  variant:
                    "outline",
                  size:
                    "lg",
                }),
                "group w-fit shrink-0 border-white/12",
              )}
            >
              View All Products

              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {featuredProducts.length >
          0 ? (
            <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.map(
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
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
                <Sparkles className="size-6" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">
                Featured products coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Explore the complete
                catalogue while we prepare
                our latest featured
                selection.
              </p>

              <Link
                href="/products"
                className={cn(
                  buttonVariants({
                    size:
                      "lg",
                  }),
                  "mt-6",
                )}
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}