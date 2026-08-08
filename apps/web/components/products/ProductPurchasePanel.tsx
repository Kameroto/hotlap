"use client";

import Link from "next/link";

import {
  ArrowRight,
  Heart,
  LoaderCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

import {
  toast,
} from "sonner";

import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductAvailability from "@/components/products/ProductAvailability";
import ProductPrice from "@/components/products/ProductPrice";
import ProductQuickSpecs from "@/components/products/ProductQuickSpecs";
import ProductRating from "@/components/products/ProductRating";

import {
  Button,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  cn,
} from "@/lib/utils";

import {
  useAuthStore,
} from "@/store/auth-store";

import {
  useCartStore,
} from "@/store/cart-store";

import {
  useWishlistStore,
} from "@/store/wishlist-store";

import type {
  Product,
} from "@/types/product";

type ProductPurchasePanelProps = {
  product: Product;
};

export default function ProductPurchasePanel({
  product,
}: ProductPurchasePanelProps) {
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

  const cart =
    useCartStore(
      (state) =>
        state.cart,
    );

  const cartHasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
    );

  const cartIsLoading =
    useCartStore(
      (state) =>
        state.isLoading,
    );

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  const productIsInWishlist =
    wishlistItems.some(
      (item) =>
        item.product.id ===
        product.id,
    );

  const cartItem =
    cart?.items.find(
      (item) =>
        item.product.id ===
        product.id,
    );

  const hasReachedStockLimit =
    cartItem !==
      undefined &&
    cartItem.quantity >=
      product.stockQuantity;

  const purchaseIsDisabled =
    !cartHasHydrated ||
    cartIsLoading ||
    !product.isInStock ||
    hasReachedStockLimit;

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
                `/login?next=${encodeURIComponent(
                  `/products/${product.slug}`,
                )}`;
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

      toast.success(
        productIsInWishlist
          ? `${product.name} removed from your wishlist.`
          : `${product.name} saved to your wishlist.`,
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

  async function handleBuyNow() {
    if (
      purchaseIsDisabled
    ) {
      return;
    }

    try {
      await addItem(
        product.id,
        1,
      );

      window.location.href =
        "/checkout";
    } catch (error) {
      const message =
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to continue to checkout.";

      toast.error(
        message,
      );
    }
  }

  return (
    <div className="lg:sticky lg:top-28">
      <div className="rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {product.brand}
          </span>

          <span className="text-white/20">
            /
          </span>

          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {product.category.name}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-black leading-[1.02] tracking-[-0.045em] text-foreground sm:text-4xl xl:text-5xl">
          {product.name}
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          {
            product.shortDescription
          }
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-5">
          <ProductRating
            rating={
              product.ratingAverage
            }
            reviewCount={
              product.reviewCount
            }
          />

          <ProductAvailability
            stockQuantity={
              product.stockQuantity
            }
            lowStockThreshold={
              product.lowStockThreshold
            }
          />
        </div>

        <div className="mt-6">
          <ProductPrice
            price={
              product.price
            }
            compareAtPrice={
              product.compareAtPrice ??
              undefined
            }
            currency="INR"
            size="large"
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          SKU:{" "}
          <span className="font-mono text-foreground/80">
            {product.sku}
          </span>
        </p>

        <div className="mt-7">
          <ProductQuickSpecs
            specifications={
              product.specifications
            }
          />
        </div>

        {product.badges.length >
          0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {product.badges.map(
              (
                badge,
              ) => (
                <span
                  key={
                    badge
                  }
                  className="rounded-full border border-primary/20 bg-primary/[0.055] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.11em] text-primary"
                >
                  {badge.replace(
                    /-/g,
                    " ",
                  )}
                </span>
              ),
            )}
          </div>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Button
            type="button"
            size="xl"
            disabled={
              purchaseIsDisabled
            }
            onClick={() => {
              void handleBuyNow();
            }}
            className="group w-full"
          >
            {cartIsLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}

            {product.isInStock
              ? "Buy Now"
              : "Unavailable"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="xl"
            disabled={
              !wishlistHasHydrated ||
              wishlistIsLoading
            }
            onClick={() => {
              void handleWishlistToggle();
            }}
            aria-pressed={
              productIsInWishlist
            }
            aria-label={
              productIsInWishlist
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            className={cn(
              "px-5",

              productIsInWishlist &&
                "border-primary/50 bg-primary/8 text-primary",
            )}
          >
            {wishlistIsLoading ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Heart
                className={cn(
                  "size-5",

                  productIsInWishlist &&
                    "fill-current",
                )}
              />
            )}

            <span className="sm:hidden">
              Wishlist
            </span>
          </Button>
        </div>

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
          size="lg"
          className="mt-3 h-12 w-full border border-white/12 bg-white/[0.035] text-foreground shadow-none hover:border-primary/50 hover:bg-primary/[0.055] hover:text-primary"
        />

        <div className="mt-7 grid gap-3 border-t border-white/8 pt-6 sm:grid-cols-3">
          <PurchaseBenefit
            icon={
              ShoppingCart
            }
            title="Stock-aware"
            text="Real inventory limits"
          />

          <PurchaseBenefit
            icon={
              PackageCheck
            }
            title="Order history"
            text="Track account orders"
          />

          <PurchaseBenefit
            icon={
              ShieldCheck
            }
            title="Account synced"
            text="Cart and wishlist"
          />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/cart"
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Review your cart before
            checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

function PurchaseBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon:
    typeof ShoppingCart;

  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2.5 sm:block">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.055] text-primary">
        <Icon className="size-4" />
      </div>

      <div className="sm:mt-3">
        <p className="text-xs font-semibold text-foreground">
          {title}
        </p>

        <p className="mt-0.5 text-[0.68rem] leading-4 text-muted-foreground">
          {text}
        </p>
      </div>
    </div>
  );
}