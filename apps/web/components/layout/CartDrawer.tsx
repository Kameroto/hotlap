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
  useState,
  type RefObject,
} from "react";

import SiteOverlay from "@/components/layout/SiteOverlay";
import ProductImage from "@/components/products/ProductImage";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";
import type {
  ServerCart,
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

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function CartDrawer({
  open,
  onClose,
  triggerRef,
}: CartDrawerProps) {
  const cart = useCartStore(
    (state) => state.cart,
  );
  const hasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
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
  const removeItem =
    useCartStore(
      (state) =>
        state.removeItem,
    );

  const [actionError, setActionError] =
    useState<string | null>(null);

  const cartIsInitializing =
    loadStatus !== "error" &&
    (!hasHydrated ||
      loadStatus === "idle" ||
      (loadStatus === "loading" &&
        !cart));
  const cartHasGlobalOperation =
    isLoading ||
    isReconciling ||
    loadStatus !== "loaded";
  const items = cart?.items ?? [];
  const checkoutIsBlocked =
    items.some(
      (item) =>
        !item.isPurchasable ||
        item.quantity >
          item.product
            .stockQuantity,
    ) ||
    cart?.coupon?.isValid ===
      false;

  async function runItemAction(
    action: () => Promise<boolean>,
    fallbackMessage: string,
  ) {
    setActionError(null);

    try {
      await action();
    } catch (error) {
      setActionError(
        error instanceof
          ApiClientError
          ? error.message
          : fallbackMessage,
      );
    }
  }

  async function retryCart() {
    setActionError(null);

    try {
      await refreshCart();
    } catch (error) {
      setActionError(
        error instanceof
          ApiClientError
          ? error.message
          : "Unable to refresh your cart.",
      );
    }
  }

  return (
    <SiteOverlay
      id="cart-drawer"
      open={open}
      onClose={onClose}
      triggerRef={triggerRef}
      labelledBy="cart-drawer-title"
      panelClassName="flex w-[min(94vw,29rem)] flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="hotlap-kicker">
            Shopping Cart
          </p>

          <h2
            id="cart-drawer-title"
            className="mt-1 text-2xl"
          >
            Your Cart
          </h2>

          <p className="hotlap-supporting-text mt-1 text-muted-foreground">
            {hasHydrated && cart
              ? `${cart.totalQuantity} ${cart.totalQuantity === 1 ? "item" : "items"}`
              : "Review your items"}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          autoFocus
          onClick={onClose}
          aria-label="Close cart drawer"
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        {cartIsInitializing ? (
          <CartLoadingState />
        ) : !cart &&
          loadStatus === "error" ? (
          <CartErrorState
            message={
              actionError ??
              loadError ??
              "Unable to load your cart."
            }
            isRetrying={isLoading}
            onRetry={() => {
              void retryCart();
            }}
          />
        ) : items.length === 0 ? (
          <CartEmptyState
            onNavigate={onClose}
          />
        ) : (
          <div className="grid gap-4">
            {(loadStatus === "error" ||
              actionError) && (
              <div
                role="alert"
                className="rounded-xl border border-primary/25 bg-primary/[0.055] p-3 text-sm leading-5 text-foreground"
              >
                {actionError ??
                  `${loadError ?? "Cart refresh failed."} The last confirmed cart remains visible.`}
              </div>
            )}

            {items.map((item) => (
              <CartDrawerItem
                key={item.id}
                item={item}
                isPending={pendingProductIds.includes(
                  item.product.id,
                )}
                globalOperationIsPending={
                  cartHasGlobalOperation
                }
                onNavigate={onClose}
                onDecrease={() =>
                  runItemAction(
                    () =>
                      decreaseQuantity(
                        item.product.id,
                        item.quantity,
                      ),
                    "Unable to decrease this quantity.",
                  )
                }
                onIncrease={() =>
                  runItemAction(
                    () =>
                      increaseQuantity(
                        item.product.id,
                        item.quantity,
                      ),
                    "Unable to increase this quantity.",
                  )
                }
                onRemove={() =>
                  runItemAction(
                    () =>
                      removeItem(
                        item.product.id,
                      ),
                    "Unable to remove this item.",
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {cart && items.length > 0 && (
        <CartDrawerFooter
          cart={cart}
          checkoutIsBlocked={
            checkoutIsBlocked
          }
          operationIsPending={
            cartHasGlobalOperation ||
            pendingProductIds.length >
              0
          }
          onNavigate={onClose}
        />
      )}
    </SiteOverlay>
  );
}

function CartDrawerItem({
  item,
  isPending,
  globalOperationIsPending,
  onNavigate,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: ServerCartItem;
  isPending: boolean;
  globalOperationIsPending: boolean;
  onNavigate: () => void;
  onDecrease: () => Promise<void>;
  onIncrease: () => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const product = item.product;
  const primaryImage =
    product.images.find(
      (image) => image.isPrimary,
    ) ?? product.images[0];
  const controlsAreDisabled =
    isPending ||
    globalOperationIsPending;
  const quantityHasConflict =
    !item.isPurchasable ||
    item.quantity >
      product.stockQuantity;

  return (
    <article
      aria-busy={isPending}
      className="rounded-2xl border border-white/10 bg-white/[0.025] p-3.5"
    >
      <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-3.5 sm:grid-cols-[88px_minmax(0,1fr)]">
        <Link
          href={`/products/${product.slug}`}
          onClick={onNavigate}
          aria-label={`View ${product.name}`}
          className="group aspect-square overflow-hidden rounded-xl border border-white/8 bg-[#080a0c] outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <ProductImage
            src={primaryImage?.url}
            alt={
              primaryImage?.alt ??
              product.name
            }
            variant="thumbnail"
          />
        </Link>

        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="hotlap-supporting-text truncate text-primary">
                {product.brand}
              </p>

              <Link
                href={`/products/${product.slug}`}
                onClick={onNavigate}
                className="mt-1 block rounded-sm font-semibold leading-snug text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none"
              >
                <span className="line-clamp-2">
                  {product.name}
                </span>
              </Link>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={
                controlsAreDisabled
              }
              onClick={() => {
                void onRemove();
              }}
              aria-label={`Remove ${product.name} from cart`}
              className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              {isPending ? (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </div>

          <p className="hotlap-supporting-text mt-2 text-muted-foreground">
            {formatCurrency(
              product.price,
              "INR",
            )}{" "}
            each
          </p>
        </div>
      </div>

      {quantityHasConflict && (
        <div
          role="alert"
          className="mt-3 flex gap-2 rounded-lg border border-primary/25 bg-primary/[0.055] p-2.5 text-sm leading-5 text-foreground"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
          This item needs availability review in your full cart.
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-white/8 pt-3">
        <div>
          <p className="hotlap-supporting-text mb-1.5 text-muted-foreground">
            Quantity
          </p>

          <div className="flex items-center rounded-lg border border-white/10 bg-black/20 p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={
                controlsAreDisabled ||
                quantityHasConflict
              }
              onClick={() => {
                void onDecrease();
              }}
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus className="size-3.5" />
            </Button>

            <span
              aria-live="polite"
              aria-label={`${product.name} quantity ${item.quantity}`}
              className="min-w-9 text-center text-sm font-semibold"
            >
              {item.quantity}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={
                controlsAreDisabled ||
                quantityHasConflict ||
                item.quantity >=
                  product.stockQuantity
              }
              onClick={() => {
                void onIncrease();
              }}
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="text-right">
          <p className="hotlap-supporting-text text-muted-foreground">
            Line total
          </p>
          <p className="mt-1 font-semibold text-foreground">
            {formatCurrency(
              item.lineTotal,
              "INR",
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

function CartDrawerFooter({
  cart,
  checkoutIsBlocked,
  operationIsPending,
  onNavigate,
}: {
  cart: ServerCart;
  checkoutIsBlocked: boolean;
  operationIsPending: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-white/10 bg-[#0b0e11] px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-18px_45px_rgba(0,0,0,0.26)] sm:px-6">
      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-4 text-muted-foreground">
          <dt>Subtotal</dt>
          <dd className="font-semibold text-foreground">
            {formatCurrency(
              cart.subtotal,
              "INR",
            )}
          </dd>
        </div>

        {cart.discountAmount > 0 && (
          <div className="flex justify-between gap-4 text-emerald-400">
            <dt>
              {cart.coupon?.code ??
                "Coupon discount"}
            </dt>
            <dd>
              -
              {formatCurrency(
                cart.discountAmount,
                "INR",
              )}
            </dd>
          </div>
        )}
      </dl>

      <p className="hotlap-supporting-text mt-3 text-muted-foreground">
        Free standard delivery on eligible orders ₹5,000+
      </p>

      {checkoutIsBlocked && (
        <p
          role="alert"
          className="mt-3 text-sm leading-5 text-primary"
        >
          Review availability or coupon issues in your full cart before checkout.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/cart"
          onClick={onNavigate}
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "lg",
            }),
            "px-3",
          )}
        >
          View Cart
        </Link>

        {checkoutIsBlocked ||
        operationIsPending ? (
          <Button
            type="button"
            size="lg"
            disabled
            className="px-3"
          >
            Checkout
          </Button>
        ) : (
          <Link
            href="/checkout"
            onClick={onNavigate}
            className={cn(
              buttonVariants({
                size: "lg",
              }),
              "px-3",
            )}
          >
            Checkout
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function CartLoadingState() {
  return (
    <div
      role="status"
      className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.018] px-5 text-center"
    >
      <LoaderCircle className="size-6 animate-spin text-primary motion-reduce:animate-none" />
      <p className="mt-4 font-semibold">
        Loading your cart
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Retrieving your confirmed items and totals.
      </p>
    </div>
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
    <div
      role="alert"
      className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.045] px-5 text-center"
    >
      <AlertTriangle className="size-6 text-primary" />
      <p className="mt-4 font-semibold">
        Unable to load your cart
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={isRetrying}
        onClick={onRetry}
        className="mt-5"
      >
        {isRetrying ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Retry
      </Button>
    </div>
  );
}

function CartEmptyState({
  onNavigate,
}: {
  onNavigate: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.018] px-5 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.07] text-primary">
        <ShoppingCart className="size-6" />
      </span>
      <p className="mt-5 text-xl font-semibold">
        Your cart is empty.
      </p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        Browse RC cars, batteries, and accessories available in the HotLap catalogue.
      </p>
      <Link
        href="/products"
        onClick={onNavigate}
        className={cn(
          buttonVariants({
            size: "lg",
          }),
          "mt-6",
        )}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
