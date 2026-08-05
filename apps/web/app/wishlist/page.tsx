"use client";

import Link from "next/link";
import {
  Heart,
  Trash2,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductCard from "@/components/products/ProductCard";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { products } from "@/data/products";
import { useWishlistStore } from "@/store/wishlist-store";

export default function WishlistPage() {
  const wishlistProductIds =
    useWishlistStore(
      (state) =>
        state.wishlistProductIds,
    );

  const hasHydrated = useWishlistStore(
    (state) => state.hasHydrated,
  );

  const clearWishlist =
    useWishlistStore(
      (state) =>
        state.clearWishlist,
    );

  const wishlistProducts =
    products.filter((product) =>
      wishlistProductIds.includes(
        product.id,
      ),
    );

  if (!hasHydrated) {
    return (
      <main>
        <Section>
          <Container>
            <div className="rounded-2xl border p-10 text-center">
              <p className="text-muted-foreground">
                Loading your wishlist...
              </p>
            </div>
          </Container>
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section>
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                Saved Products
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight lg:text-5xl">
                Your Wishlist
              </h1>

              <p className="mt-4 text-muted-foreground">
                {wishlistProducts.length}{" "}
                {wishlistProducts.length === 1
                  ? "product"
                  : "products"}{" "}
                saved
              </p>
            </div>

            {wishlistProducts.length >
              0 && (
              <Button
                type="button"
                variant="outline"
                onClick={clearWishlist}
              >
                <Trash2 className="h-4 w-4" />
                Clear Wishlist
              </Button>
            )}
          </div>

          {wishlistProducts.length >
          0 ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {wishlistProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Heart className="h-7 w-7 text-muted-foreground" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold">
                Your wishlist is empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Save products you are interested
                in and return to them whenever
                you are ready.
              </p>

              <Link
                href="/products"
                className={`${buttonVariants()} mt-8`}
              >
                Explore Products
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}