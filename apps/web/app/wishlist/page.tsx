"use client";

import Link from "next/link";

import {
  Heart,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import {
  toast,
} from "sonner";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductCard from "@/components/products/ProductCard";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  useAuthStore,
} from "@/store/auth-store";

import {
  useWishlistStore,
} from "@/store/wishlist-store";

export default function WishlistPage() {
  const authStatus =
    useAuthStore(
      (state) =>
        state.status,
    );

  const items =
    useWishlistStore(
      (state) =>
        state.items,
    );

  const hasHydrated =
    useWishlistStore(
      (state) =>
        state.hasHydrated,
    );

  const isLoading =
    useWishlistStore(
      (state) =>
        state.isLoading,
    );

  const clearWishlist =
    useWishlistStore(
      (state) =>
        state.clearWishlist,
    );

  async function handleClearWishlist() {
    try {
      await clearWishlist();

      toast.success(
        "Your wishlist has been cleared.",
      );
    } catch (error) {
      toast.error(
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to clear your wishlist.",
      );
    }
  }

  if (
    authStatus ===
      "loading" ||
    !hasHydrated
  ) {
    return (
      <main>
        <Section>
          <Container>
            <div className="rounded-2xl border p-10 text-center">
              <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-red-600" />

              <p className="mt-3 text-muted-foreground">
                Loading your wishlist...
              </p>
            </div>
          </Container>
        </Section>
      </main>
    );
  }

  if (
    authStatus !==
    "authenticated"
  ) {
    return (
      <main>
        <Section>
          <Container>
            <div className="mx-auto max-w-xl rounded-3xl border px-6 py-16 text-center">
              <Heart className="mx-auto h-9 w-9 text-red-600" />

              <h1 className="mt-5 text-3xl font-bold">
                Sign in to view your wishlist
              </h1>

              <p className="mt-3 text-muted-foreground">
                Save your favourite
                HotLap products and
                access them from any
                signed-in device.
              </p>

              <Link
                href="/login"
                className={`${buttonVariants({
                  size: "lg",
                })} mt-7`}
              >
                Sign In
              </Link>
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
                {items.length}{" "}
                {items.length ===
                1
                  ? "product"
                  : "products"}{" "}
                saved
              </p>
            </div>

            {items.length >
              0 && (
              <Button
                type="button"
                variant="outline"
                disabled={
                  isLoading
                }
                onClick={() => {
                  void handleClearWishlist();
                }}
              >
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Clear Wishlist
              </Button>
            )}
          </div>

          {items.length >
          0 ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {items.map(
                (item) => (
                  <ProductCard
                    key={
                      item.id
                    }
                    product={
                      item.product
                    }
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
                Save products you are
                interested in and
                return to them
                whenever you are
                ready.
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