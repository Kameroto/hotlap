"use client";

import Link from "next/link";

import {
  LoaderCircle,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import {
  toast,
} from "sonner";

import PromoCodeForm from "@/components/cart/PromoCodeForm";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductImage from "@/components/products/ProductImage";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  formatCurrency,
} from "@/lib/format-currency";

import {
  cn,
} from "@/lib/utils";

import {
  useCartStore,
} from "@/store/cart-store";

export default function CartPage() {
  const cart =
    useCartStore(
      (state) =>
        state.cart,
    );

  const hasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
    );

  const isLoading =
    useCartStore(
      (state) =>
        state.isLoading,
    );

  const increaseQuantity =
    useCartStore(
      (state) =>
        state.increaseQuantity,
    );

  const decreaseQuantity =
    useCartStore(
      (state) =>
        state.decreaseQuantity,
    );

  const removeItem =
    useCartStore(
      (state) =>
        state.removeItem,
    );

  async function runCartAction(
    action:
      () => Promise<void>,
    fallbackMessage: string,
  ) {
    try {
      await action();
    } catch (error) {
      toast.error(
        error instanceof
        ApiClientError
          ? error.message
          : fallbackMessage,
      );
    }
  }

  async function clearCart() {
    if (!cart) {
      return;
    }

    const productIds =
      cart.items.map(
        (item) =>
          item.product.id,
      );

    for (
      const productId of
      productIds
    ) {
      await removeItem(
        productId,
      );
    }

    toast.success(
      "Your cart has been cleared.",
    );
  }

  if (!hasHydrated) {
    return (
      <main>
        <Section>
          <Container>
            <div className="rounded-2xl border p-10 text-center">
              <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-red-600" />

              <p className="mt-3 text-muted-foreground">
                Loading your cart...
              </p>
            </div>
          </Container>
        </Section>
      </main>
    );
  }

  const items =
    cart?.items ?? [];

  const totalQuantity =
    cart?.totalQuantity ??
    0;

  const subtotal =
    cart?.subtotal ?? 0;

  const discountAmount =
    cart?.discountAmount ??
    0;

  const total =
    cart?.totalBeforeShipping ??
    0;

  return (
    <main>
      <Section>
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                Shopping Cart
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight lg:text-5xl">
                Your Cart
              </h1>

              <p className="mt-4 text-muted-foreground">
                {totalQuantity}{" "}
                {totalQuantity ===
                1
                  ? "item"
                  : "items"}{" "}
                in your cart
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
                  void runCartAction(
                    clearCart,
                    "Unable to clear your cart.",
                  );
                }}
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </Button>
            )}
          </div>

          {items.length > 0 ? (
            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                {items.map(
                  (item) => {
                    const product =
                      item.product;

                    const primaryImage =
                      product.images.find(
                        (
                          image,
                        ) =>
                          image.isPrimary,
                      ) ??
                      product
                        .images[0];

                    return (
                      <article
                        key={
                          item.id
                        }
                        className="grid gap-6 rounded-2xl border p-5 sm:grid-cols-[180px_1fr]"
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          className="group overflow-hidden rounded-xl border bg-muted"
                        >
                          <ProductImage
                            src={
                              primaryImage?.url
                            }
                            alt={
                              primaryImage?.alt ??
                              product.name
                            }
                          />
                        </Link>

                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                                {
                                  product.brand
                                }
                              </p>

                              <Link
                                href={`/products/${product.slug}`}
                              >
                                <h2 className="mt-2 text-xl font-semibold hover:text-red-600">
                                  {
                                    product.name
                                  }
                                </h2>
                              </Link>

                              <p className="mt-3 font-semibold">
                                {formatCurrency(
                                  product.price,
                                  "INR",
                                )}
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                isLoading
                              }
                              aria-label={`Remove ${product.name} from cart`}
                              onClick={() => {
                                void runCartAction(
                                  () =>
                                    removeItem(
                                      product.id,
                                    ),
                                  "Unable to remove the item.",
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex w-fit items-center rounded-lg border">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={
                                  isLoading
                                }
                                aria-label={`Decrease ${product.name} quantity`}
                                onClick={() => {
                                  void runCartAction(
                                    () =>
                                      decreaseQuantity(
                                        product.id,
                                        item.quantity,
                                      ),
                                    "Unable to update quantity.",
                                  );
                                }}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <span className="min-w-10 text-center text-sm font-semibold">
                                {
                                  item.quantity
                                }
                              </span>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={
                                  isLoading ||
                                  item.quantity >=
                                    product.stockQuantity
                                }
                                aria-label={`Increase ${product.name} quantity`}
                                onClick={() => {
                                  void runCartAction(
                                    () =>
                                      increaseQuantity(
                                        product.id,
                                        item.quantity,
                                      ),
                                    "Unable to update quantity.",
                                  );
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <p className="font-bold">
                              {formatCurrency(
                                item.lineTotal,
                                "INR",
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>

              <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
                <h2 className="text-2xl font-semibold">
                  Order Summary
                </h2>

                <div className="mt-6">
                  <PromoCodeForm
                    subtotal={
                      subtotal
                    }
                  />
                </div>

                <div className="mt-6 space-y-4 border-t pt-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      {formatCurrency(
                        subtotal,
                        "INR",
                      )}
                    </span>
                  </div>

                  {discountAmount >
                    0 && (
                    <div className="flex justify-between text-green-700">
                      <span>
                        Coupon discount
                      </span>

                      <span>
                        -
                        {formatCurrency(
                          discountAmount,
                          "INR",
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      Shipping
                    </span>

                    <span>
                      Calculated at
                      checkout
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>
                        Total
                      </span>

                      <span>
                        {formatCurrency(
                          total,
                          "INR",
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className={cn(
                    buttonVariants({
                      size: "lg",
                    }),
                    "mt-6 w-full",
                  )}
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({
                      variant:
                        "outline",
                      size: "lg",
                    }),
                    "mt-3 w-full",
                  )}
                >
                  Continue Shopping
                </Link>
              </aside>
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-7 w-7 text-muted-foreground" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Add products to your
                cart and they will
                appear here.
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