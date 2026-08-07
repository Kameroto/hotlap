"use client";

import Link from "next/link";

import {
  Heart,
  LoaderCircle,
} from "lucide-react";

import {
  toast,
} from "sonner";

import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductImage from "@/components/products/ProductImage";
import ProductPrice from "@/components/products/ProductPrice";
import ProductRating from "@/components/products/ProductRating";

import {
  Button,
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

import type {
  Product,
} from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const authStatus =
    useAuthStore(
      (state) =>
        state.status,
    );

  const wishlistItems =
    useWishlistStore(
      (state) =>
        state.items,
    );

  const wishlistHasHydrated =
    useWishlistStore(
      (state) =>
        state.hasHydrated,
    );

  const wishlistIsLoading =
    useWishlistStore(
      (state) =>
        state.isLoading,
    );

  const toggleWishlist =
    useWishlistStore(
      (state) =>
        state.toggleWishlist,
    );

  const primaryImage =
    product.images.find(
      (image) =>
        image.isPrimary,
    ) ??
    product.images[0];

  const productIsInWishlist =
    wishlistItems.some(
      (item) =>
        item.product.id ===
        product.id,
    );

  async function handleWishlistToggle() {
    if (
      authStatus !==
      "authenticated"
    ) {
      toast.info(
        "Sign in to save products to your wishlist.",
        {
          action: {
            label:
              "Sign In",

            onClick: () => {
              window.location.href =
                "/login";
            },
          },
        },
      );

      return;
    }

    try {
      await toggleWishlist(
        product.id,
      );

      if (
        productIsInWishlist
      ) {
        toast.info(
          `${product.name} removed from your wishlist.`,
        );

        return;
      }

      toast.success(
        `${product.name} saved to your wishlist.`,
        {
          action: {
            label:
              "View Wishlist",

            onClick: () => {
              window.location.href =
                "/wishlist";
            },
          },
        },
      );
    } catch (error) {
      const message =
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to update your wishlist.";

      toast.error(
        message,
      );
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={
              primaryImage?.url
            }
            alt={
              primaryImage?.alt ??
              product.name
            }
            badges={
              product.badges
            }
          />
        </Link>

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={
            !wishlistHasHydrated ||
            wishlistIsLoading
          }
          aria-label={
            productIsInWishlist
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={
            productIsInWishlist
          }
          onClick={() => {
            void handleWishlistToggle();
          }}
          className={`absolute top-4 right-4 z-10 rounded-full shadow-sm backdrop-blur ${
            productIsInWishlist
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-background/90"
          }`}
        >
          {wishlistIsLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={`h-4 w-4 ${
                productIsInWishlist
                  ? "fill-current"
                  : ""
              }`}
            />
          )}
        </Button>
      </div>

      <div className="flex flex-col p-5">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-2"
        >
          <h3 className="line-clamp-2 text-xl font-semibold tracking-tight transition-colors hover:text-red-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {
            product.shortDescription
          }
        </p>

        <div className="mt-4">
          <ProductRating
            rating={
              product.ratingAverage
            }
            reviewCount={
              product.reviewCount
            }
          />
        </div>

        <div className="mt-4">
          <ProductPrice
            price={
              product.price
            }
            compareAtPrice={
              product.compareAtPrice ??
              undefined
            }
            currency="INR"
          />
        </div>

        <p
          className={`mt-3 text-sm font-medium ${
            product.isInStock
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {product.isInStock
            ? `${product.stockQuantity} in stock`
            : "Out of stock"}
        </p>

        <AddToCartButton
          productId={
            product.id
          }
          productName={
            product.name
          }
          stockQuantity={
            product.stockQuantity
          }
          className="mt-5 w-full"
        />
      </div>
    </article>
  );
}