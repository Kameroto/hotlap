"use client";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  Heart,
  LoaderCircle,
  LogIn,
  RefreshCw,
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
  cn,
} from "@/lib/utils";

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

  const loadStatus =
    useWishlistStore(
      (state) =>
        state.loadStatus,
    );

  const loadError =
    useWishlistStore(
      (state) =>
        state.loadError,
    );

  const isLoading =
    useWishlistStore(
      (state) =>
        state.isLoading,
    );

  const pendingProductCount =
    useWishlistStore(
      (state) =>
        state.pendingProductIds
          .length,
    );

  const refreshWishlist =
    useWishlistStore(
      (state) =>
        state.refreshWishlist,
    );

  const clearWishlist =
    useWishlistStore(
      (state) =>
        state.clearWishlist,
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

  function closeClearDialog() {
    clearDialogReference.current?.close();
  }

  async function handleRetry() {
    try {
      await refreshWishlist();
    } catch (error) {
      toast.error(
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to load your wishlist.",
      );
    }
  }

  async function handleClearWishlist() {
    if (
      clearInFlightReference.current
    ) {
      return;
    }

    clearInFlightReference.current =
      true;

    try {
      await clearWishlist();

      closeClearDialog();

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
    } finally {
      clearInFlightReference.current =
        false;
    }
  }

  const wishlistIsInitializing =
    authStatus === "idle" ||
    authStatus === "loading" ||
    (
      authStatus ===
        "authenticated" &&
      (
        loadStatus === "idle" ||
        loadStatus === "loading"
      )
    );

  if (wishlistIsInitializing) {
    return <WishlistLoadingState />;
  }

  if (
    authStatus !==
    "authenticated"
  ) {
    return <SignedOutState />;
  }

  if (loadStatus === "error") {
    return (
      <WishlistErrorState
        message={
          loadError ??
          "Unable to load your wishlist."
        }
        isRetrying={
          isLoading
        }
        onRetry={() => {
          void handleRetry();
        }}
      />
    );
  }

  return (
    <main className="overflow-hidden bg-[#080a0c]">
      <Section className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />
        <div className="pointer-events-none absolute top-0 right-[-12%] size-[480px] rounded-full bg-primary/[0.04] blur-[140px]" />

        <Container>
          <div className="relative">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="hotlap-kicker">
                  Saved Products
                </p>

                <h1 className="hotlap-heading mt-4 text-4xl text-foreground sm:text-5xl">
                  Your Wishlist.
                </h1>

                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  <strong className="font-semibold text-foreground">
                    {items.length}
                  </strong>{" "}
                  {items.length === 1
                    ? "product"
                    : "products"}{" "}
                  saved to your HotLap
                  account.
                </p>
              </div>

              {items.length > 0 && (
                <Button
                  ref={
                    clearTriggerReference
                  }
                  type="button"
                  variant="outline"
                  disabled={
                    isLoading ||
                    pendingProductCount >
                      0
                  }
                  onClick={() => {
                    clearDialogReference.current?.showModal();
                  }}
                  className="w-full border-white/12 sm:w-auto"
                >
                  <Trash2 className="size-4" />
                  Clear Wishlist
                </Button>
              )}
            </div>

            {items.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map(
                  (item) => (
                    <ProductCard
                      key={item.id}
                      product={
                        item.product
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <WishlistEmptyState />
            )}
          </div>
        </Container>
      </Section>

      <dialog
        ref={
          clearDialogReference
        }
        aria-labelledby="clear-wishlist-title"
        aria-describedby="clear-wishlist-description"
        onCancel={(event) => {
          if (isLoading) {
            event.preventDefault();
          }
        }}
        onClose={() => {
          requestAnimationFrame(
            () => {
              clearTriggerReference.current?.focus();
            },
          );
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
              disabled={
                isLoading
              }
              onClick={
                closeClearDialog
              }
              aria-label="Close clear wishlist confirmation"
            >
              <X className="size-4" />
            </Button>
          </div>

          <h2
            id="clear-wishlist-title"
            className="mt-5 text-2xl font-bold tracking-tight"
          >
            Clear your wishlist?
          </h2>

          <p
            id="clear-wishlist-description"
            className="mt-3 text-sm leading-6 text-muted-foreground"
          >
            This removes all currently
            saved products from your
            HotLap account. You can save
            products again later.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              autoFocus
              disabled={
                isLoading
              }
              onClick={
                closeClearDialog
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={
                isLoading
              }
              onClick={() => {
                void handleClearWishlist();
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

function WishlistLoadingState() {
  return (
    <main className="bg-[#080a0c]">
      <Section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />

        <Container>
          <div className="relative animate-pulse motion-reduce:animate-none">
            <div className="h-4 w-32 rounded bg-primary/15" />
            <div className="mt-5 h-12 max-w-md rounded bg-white/8" />
            <div className="mt-4 h-5 max-w-xs rounded bg-white/6" />

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#101316]"
                >
                  <div className="aspect-square bg-white/6" />
                  <div className="space-y-4 p-5">
                    <div className="h-5 w-24 rounded bg-primary/12" />
                    <div className="h-7 w-3/4 rounded bg-white/8" />
                    <div className="h-4 w-full rounded bg-white/6" />
                    <div className="h-10 w-full rounded bg-white/8" />
                  </div>
                </div>
              ))}
            </div>

            <span className="sr-only" role="status">
              Loading your wishlist
            </span>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function SignedOutState() {
  return (
    <WishlistStateShell>
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
        <LogIn className="size-6" />
      </div>

      <h1 className="hotlap-heading mt-6 text-3xl text-foreground sm:text-4xl">
        Sign in to view your wishlist.
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
        Save your favourite HotLap
        products and access them from
        any signed-in device.
      </p>

      <Link
        href="/login?next=%2Fwishlist"
        className={cn(
          buttonVariants({
            size: "lg",
          }),
          "mt-7",
        )}
      >
        Sign In
        <ArrowRight className="size-4" />
      </Link>
    </WishlistStateShell>
  );
}

function WishlistErrorState({
  message,
  isRetrying,
  onRetry,
}: {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <WishlistStateShell>
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
        <AlertTriangle className="size-6" />
      </div>

      <h1 className="hotlap-heading mt-6 text-3xl text-foreground sm:text-4xl">
        We couldn&apos;t load your wishlist.
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
        {message} Your saved products
        have not been replaced with an
        empty list.
      </p>

      <Button
        type="button"
        size="lg"
        disabled={
          isRetrying
        }
        onClick={
          onRetry
        }
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
    </WishlistStateShell>
  );
}

function WishlistEmptyState() {
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-dashed border-white/12 bg-[#101316] px-6 py-16 text-center sm:py-20">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/8 text-primary">
        <Heart className="size-7" />
      </div>

      <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        Your wishlist is empty
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
        Save products you are interested
        in and return to them whenever
        you are ready.
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

function WishlistStateShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="bg-[#080a0c]">
      <Section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />
        <div className="pointer-events-none absolute top-0 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[130px]" />

        <Container>
          <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#101316] px-6 py-14 text-center shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:px-10 sm:py-16">
            {children}
          </div>
        </Container>
      </Section>
    </main>
  );
}
