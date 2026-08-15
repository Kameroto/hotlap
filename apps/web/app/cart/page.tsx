"use client";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  LoaderCircle,
  Minus,
  Plus,
  RefreshCw,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import {
  useRef,
  type ReactNode,
} from "react";

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

import type {
  ServerCartItem,
} from "@/lib/api/types";

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

  const loadStatus =
    useCartStore(
      (state) =>
        state.loadStatus,
    );

  const loadError =
    useCartStore(
      (state) =>
        state.loadError,
    );

  const isLoading =
    useCartStore(
      (state) =>
        state.isLoading,
    );

  const isReconciling =
    useCartStore(
      (state) =>
        state.isReconciling,
    );

  const pendingProductIds =
    useCartStore(
      (state) =>
        state.pendingProductIds,
    );

  const refreshCart =
    useCartStore(
      (state) =>
        state.refreshCart,
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

  const setQuantity =
    useCartStore(
      (state) =>
        state.setQuantity,
    );

  const removeItem =
    useCartStore(
      (state) =>
        state.removeItem,
    );

  const clearCart =
    useCartStore(
      (state) =>
        state.clearCart,
    );

  const clearDialogReference =
    useRef<HTMLDialogElement>(
      null,
    );

  const clearTriggerReference =
    useRef<HTMLButtonElement>(
      null,
    );

  const clearInFlightReference =
    useRef(false);

  async function handleRetry() {
    try {
      await refreshCart();
    } catch (error) {
      toast.error(
        getActionErrorMessage(
          error,
          "Unable to load your cart.",
        ),
      );
    }
  }

  async function runItemAction(
    action: () => Promise<boolean>,
    successMessage: string,
    fallbackMessage: string,
  ) {
    try {
      const actionWasPerformed =
        await action();

      if (actionWasPerformed) {
        toast.success(
          successMessage,
        );
      }
    } catch (error) {
      toast.error(
        getActionErrorMessage(
          error,
          fallbackMessage,
        ),
      );
    }
  }

  async function handleClearCart() {
    if (
      clearInFlightReference.current
    ) {
      return;
    }

    clearInFlightReference.current =
      true;

    try {
      const cartWasCleared =
        await clearCart();

      if (!cartWasCleared) {
        return;
      }

      clearDialogReference.current?.close();
      toast.success(
        "Your cart has been cleared.",
      );
    } catch (error) {
      toast.error(
        `${getActionErrorMessage(
          error,
          "Unable to clear your cart.",
        )} Confirmed removals are reflected below.`,
      );
    } finally {
      clearInFlightReference.current =
        false;
    }
  }

  const cartIsInitializing =
    !cart &&
    (
      loadStatus === "idle" ||
      loadStatus === "loading"
    );

  if (cartIsInitializing) {
    return <CartLoadingState />;
  }

  if (
    !cart &&
    loadStatus === "error"
  ) {
    return (
      <CartErrorState
        message={
          loadError ??
          "Unable to load your cart."
        }
        isRetrying={isLoading}
        onRetry={() => {
          void handleRetry();
        }}
      />
    );
  }

  const items =
    cart?.items ?? [];

  const invalidItems =
    items.filter(
      itemHasStockConflict,
    );

  const couponIsInvalid =
    cart?.coupon?.isValid ===
    false;

  const checkoutIsBlocked =
    invalidItems.length > 0 ||
    couponIsInvalid;

  const cartHasGlobalOperation =
    isLoading ||
    isReconciling ||
    loadStatus !== "loaded";

  return (
    <main className="overflow-hidden bg-[#080a0c]">
      <Section className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />
        <div className="pointer-events-none absolute top-0 right-[-12%] size-[520px] rounded-full bg-primary/[0.04] blur-[150px]" />

        <Container>
          <div className="relative">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="hotlap-kicker">
                  Shopping Cart
                </p>

                <h1 className="hotlap-heading mt-4 text-4xl text-foreground sm:text-5xl">
                  Your Cart.
                </h1>

                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  <strong className="font-semibold text-foreground">
                    {cart?.totalQuantity ?? 0}
                  </strong>{" "}
                  {(cart?.totalQuantity ?? 0) === 1
                    ? "item"
                    : "items"}{" "}
                  ready for review.
                </p>
              </div>

              {items.length > 0 && (
                <Button
                  ref={clearTriggerReference}
                  type="button"
                  variant="outline"
                  disabled={
                    cartHasGlobalOperation ||
                    pendingProductIds.length >
                      0
                  }
                  onClick={() => {
                    clearDialogReference.current?.showModal();
                  }}
                  className="w-full border-white/12 sm:w-auto"
                >
                  <Trash2 className="size-4" />
                  Clear Cart
                </Button>
              )}
            </div>

            {loadStatus === "error" && cart && (
              <div
                role="alert"
                className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary/25 bg-primary/[0.055] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Cart refresh failed
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {loadError} The last confirmed cart remains visible.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => {
                    void handleRetry();
                  }}
                  className="shrink-0"
                >
                  {isLoading ? (
                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Retry
                </Button>
              </div>
            )}

            {items.length > 0 ? (
              <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
                <div className="space-y-5">
                  {items.map((item) => {
                    const productIsPending =
                      pendingProductIds.includes(
                        item.product.id,
                      );

                    return (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        isPending={productIsPending}
                        globalOperationIsPending={cartHasGlobalOperation}
                        onDecrease={() =>
                          runItemAction(
                            () =>
                              decreaseQuantity(
                                item.product.id,
                                item.quantity,
                              ),
                            `${item.product.name} quantity updated.`,
                            "Unable to update quantity.",
                          )
                        }
                        onIncrease={() =>
                          runItemAction(
                            () =>
                              increaseQuantity(
                                item.product.id,
                                item.quantity,
                              ),
                            `${item.product.name} quantity updated.`,
                            "Unable to update quantity.",
                          )
                        }
                        onAdjustToStock={() =>
                          runItemAction(
                            () =>
                              setQuantity(
                                item.product.id,
                                item.product.stockQuantity,
                              ),
                            `${item.product.name} adjusted to available stock.`,
                            "Unable to adjust this item.",
                          )
                        }
                        onRemove={() =>
                          runItemAction(
                            () =>
                              removeItem(
                                item.product.id,
                              ),
                            `${item.product.name} removed from your cart.`,
                            "Unable to remove this item.",
                          )
                        }
                      />
                    );
                  })}
                </div>

                <CartSummary
                  subtotal={cart?.subtotal ?? 0}
                  discountAmount={cart?.discountAmount ?? 0}
                  totalBeforeShipping={cart?.totalBeforeShipping ?? 0}
                  checkoutIsBlocked={checkoutIsBlocked}
                  invalidItemCount={invalidItems.length}
                  couponIsInvalid={couponIsInvalid}
                  globalOperationIsPending={cartHasGlobalOperation}
                  itemMutationIsPending={pendingProductIds.length > 0}
                />
              </div>
            ) : (
              <CartEmptyState />
            )}
          </div>
        </Container>
      </Section>

      <dialog
        ref={clearDialogReference}
        aria-labelledby="clear-cart-title"
        aria-describedby="clear-cart-description"
        onCancel={(event) => {
          if (isLoading) {
            event.preventDefault();
          }
        }}
        onClose={() => {
          requestAnimationFrame(() => {
            clearTriggerReference.current?.focus();
          });
        }}
        className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-white/10 bg-[#101316] p-0 text-foreground shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isLoading}
              onClick={() => {
                clearDialogReference.current?.close();
              }}
              aria-label="Close clear cart confirmation"
            >
              <X className="size-4" />
            </Button>
          </div>

          <h2
            id="clear-cart-title"
            className="mt-5 text-2xl font-bold tracking-tight"
          >
            Clear your cart?
          </h2>

          <p
            id="clear-cart-description"
            className="mt-3 text-sm leading-6 text-muted-foreground"
          >
            This removes every item currently in your cart. Confirmed removals cannot be undone.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              autoFocus
              disabled={isLoading}
              onClick={() => {
                clearDialogReference.current?.close();
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={() => {
                void handleClearCart();
              }}
            >
              {isLoading ? (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {isLoading
                ? "Clearing..."
                : "Clear All"}
            </Button>
          </div>
        </div>
      </dialog>
    </main>
  );
}

function CartItemCard({
  item,
  isPending,
  globalOperationIsPending,
  onDecrease,
  onIncrease,
  onAdjustToStock,
  onRemove,
}: {
  item: ServerCartItem;
  isPending: boolean;
  globalOperationIsPending: boolean;
  onDecrease: () => Promise<void>;
  onIncrease: () => Promise<void>;
  onAdjustToStock: () => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const { product } = item;

  const primaryImage =
    product.images.find(
      (image) =>
        image.isPrimary,
    ) ?? product.images[0];

  const stockConflict =
    getStockConflict(item);

  const controlsAreDisabled =
    isPending ||
    globalOperationIsPending;

  const quantityControlsAreDisabled =
    controlsAreDisabled ||
    stockConflict !== null;

  return (
    <article
      aria-busy={isPending}
      className="grid gap-5 rounded-2xl border border-white/10 bg-[#101316] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.2)] sm:grid-cols-[160px_minmax(0,1fr)] sm:p-5"
    >
      <Link
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="group aspect-[4/3] overflow-hidden rounded-xl border border-white/8 bg-[#0b0d0f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-square"
      >
        <ProductImage
          src={primaryImage?.url}
          alt={
            primaryImage?.alt ??
            product.name
          }
        />
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {product.brand}
            </p>

            <Link
              href={`/products/${product.slug}`}
              className="mt-2 inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <h2 className="text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary motion-reduce:transition-none sm:text-xl">
                {product.name}
              </h2>
            </Link>

            <p className="mt-2 text-sm text-muted-foreground">
              Unit price{" "}
              <strong className="font-semibold text-foreground">
                {formatCurrency(
                  product.price,
                  "INR",
                )}
              </strong>
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={controlsAreDisabled}
            aria-label={`Remove ${product.name} from cart`}
            aria-busy={isPending}
            onClick={() => {
              void onRemove();
            }}
            className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {stockConflict && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-primary/25 bg-primary/[0.055] p-3"
          >
            <div className="flex gap-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm leading-5 text-foreground">
                {stockConflict}
              </p>
            </div>

            {item.isPurchasable &&
              product.stockQuantity > 0 &&
              item.quantity > product.stockQuantity && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={controlsAreDisabled}
                  onClick={() => {
                    void onAdjustToStock();
                  }}
                  className="mt-3 border-primary/30"
                >
                  Adjust to {product.stockQuantity}
                </Button>
              )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 sm:mt-auto sm:pt-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <span>Quantity</span>
              {isPending && (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 normal-case tracking-normal text-primary"
                >
                  <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" />
                  Updating
                </span>
              )}
            </div>

            <div className="flex w-fit items-center rounded-xl border border-white/10 bg-black/20 p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={quantityControlsAreDisabled}
                aria-label={`Decrease ${product.name} quantity`}
                onClick={() => {
                  void onDecrease();
                }}
                className="size-10"
              >
                <Minus className="size-4" />
              </Button>

              <span
                aria-live="polite"
                aria-label={`${product.name} quantity ${item.quantity}`}
                className="min-w-11 text-center text-sm font-bold text-foreground"
              >
                {item.quantity}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={
                  quantityControlsAreDisabled ||
                  item.quantity >=
                    product.stockQuantity
                }
                aria-label={`Increase ${product.name} quantity`}
                onClick={() => {
                  void onIncrease();
                }}
                className="size-10"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Line total
            </p>
            <p className="mt-2 text-lg font-bold text-foreground">
              {formatCurrency(
                item.lineTotal,
                "INR",
              )}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function CartSummary({
  subtotal,
  discountAmount,
  totalBeforeShipping,
  checkoutIsBlocked,
  invalidItemCount,
  couponIsInvalid,
  globalOperationIsPending,
  itemMutationIsPending,
}: {
  subtotal: number;
  discountAmount: number;
  totalBeforeShipping: number;
  checkoutIsBlocked: boolean;
  invalidItemCount: number;
  couponIsInvalid: boolean;
  globalOperationIsPending: boolean;
  itemMutationIsPending: boolean;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.3)] sm:p-6 lg:sticky lg:top-24">
      <p className="hotlap-kicker">
        Order Review
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        Cart Summary
      </h2>

      <div className="mt-6">
        <PromoCodeForm
          subtotal={subtotal}
        />
      </div>

      <dl className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>Subtotal</dt>
          <dd>
            {formatCurrency(
              subtotal,
              "INR",
            )}
          </dd>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between gap-4 text-emerald-400">
            <dt>Coupon discount</dt>
            <dd>
              -{formatCurrency(
                discountAmount,
                "INR",
              )}
            </dd>
          </div>
        )}

        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>Shipping</dt>
          <dd className="text-right">
            Calculated at checkout
          </dd>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between gap-4 text-base font-bold text-foreground">
            <dt>Total before shipping</dt>
            <dd>
              {formatCurrency(
                totalBeforeShipping,
                "INR",
              )}
            </dd>
          </div>
        </div>
      </dl>

      {checkoutIsBlocked && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-primary/25 bg-primary/[0.055] p-3 text-sm leading-5 text-foreground"
        >
          {invalidItemCount > 0 && (
            <p>
              Resolve {invalidItemCount}{" "}
              {invalidItemCount === 1
                ? "item"
                : "items"}{" "}
              with an availability conflict before checkout.
            </p>
          )}

          {couponIsInvalid && (
            <p
              className={
                invalidItemCount > 0
                  ? "mt-2"
                  : undefined
              }
            >
              Remove or resolve the invalid coupon before checkout.
            </p>
          )}
        </div>
      )}

      {checkoutIsBlocked ||
      globalOperationIsPending ||
      itemMutationIsPending ? (
        <Button
          type="button"
          size="lg"
          disabled
          className="mt-6 w-full"
        >
          Proceed to Checkout
        </Button>
      ) : (
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
          <ArrowRight className="size-4" />
        </Link>
      )}

      <Link
        href="/products"
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "lg",
          }),
          "mt-3 w-full border-white/12",
        )}
      >
        Continue Shopping
      </Link>
    </aside>
  );
}

function CartLoadingState() {
  return (
    <main className="bg-[#080a0c]">
      <Section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />
        <Container>
          <div className="animate-pulse motion-reduce:animate-none">
            <div className="h-4 w-28 rounded bg-primary/15" />
            <div className="mt-5 h-12 max-w-sm rounded bg-white/8" />
            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                {[0, 1].map((item) => (
                  <div
                    key={item}
                    className="h-56 rounded-2xl border border-white/10 bg-[#101316]"
                  />
                ))}
              </div>
              <div className="h-96 rounded-2xl border border-white/10 bg-[#101316]" />
            </div>
            <span className="sr-only" role="status">
              Loading your cart
            </span>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function CartErrorState({
  message,
  isRetrying,
  onRetry,
}: {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <CartStateShell>
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="hotlap-heading mt-6 text-3xl text-foreground sm:text-4xl">
        We couldn&apos;t load your cart.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
        {message} Your cart has not been replaced with an empty one.
      </p>
      <Button
        type="button"
        size="lg"
        disabled={isRetrying}
        onClick={onRetry}
        className="mt-7"
      >
        {isRetrying ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {isRetrying
          ? "Retrying..."
          : "Try Again"}
      </Button>
    </CartStateShell>
  );
}

function CartEmptyState() {
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-dashed border-white/12 bg-[#101316] px-6 py-16 text-center sm:py-20">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/8 text-primary">
        <ShoppingCart className="size-7" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        Your cart is empty
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
        Explore the catalogue and add the products you want to review before checkout.
      </p>
      <Link
        href="/products"
        className={cn(
          buttonVariants({
            size: "lg",
          }),
          "mt-8",
        )}
      >
        Explore Products
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function CartStateShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="bg-[#080a0c]">
      <Section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />
        <Container>
          <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#101316] px-6 py-14 text-center shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:px-10 sm:py-16">
            {children}
          </div>
        </Container>
      </Section>
    </main>
  );
}

function itemHasStockConflict(
  item: ServerCartItem,
): boolean {
  return (
    !item.isPurchasable ||
    item.quantity >
      item.product.stockQuantity
  );
}

function getStockConflict(
  item: ServerCartItem,
): string | null {
  if (
    item.product.stockQuantity <=
    0
  ) {
    return "This product is currently out of stock. Remove it before checkout.";
  }

  if (!item.isPurchasable) {
    return "This product is no longer available for purchase. Remove it before checkout.";
  }

  if (
    item.quantity >
    item.product.stockQuantity
  ) {
    return `Only ${item.product.stockQuantity} ${item.product.stockQuantity === 1 ? "unit is" : "units are"} currently available. Adjust the quantity before checkout.`;
  }

  return null;
}

function getActionErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof
    ApiClientError
    ? error.message
    : fallbackMessage;
}
