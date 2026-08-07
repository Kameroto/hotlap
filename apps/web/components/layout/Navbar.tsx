"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";
import {
  useState,
} from "react";

import {
  Heart,
  Menu,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

import Container from "@/components/layout/Container";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

import {
  useCartStore,
} from "@/store/cart-store";

import {
  useWishlistStore,
} from "@/store/wishlist-store";

const navigationLinks = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/products",
    label: "Products",
  },
  {
    href: "/events",
    label: "Events",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

export default function Navbar() {
  const pathname =
    usePathname();

  const [
    mobileMenuIsOpen,
    setMobileMenuIsOpen,
  ] = useState(false);

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

  const wishlistCount =
    wishlistItems.length;

  const cartQuantity =
    cart?.totalQuantity ??
    0;

  const visibleWishlistCount =
    wishlistHasHydrated
      ? wishlistCount
      : 0;

  const visibleCartQuantity =
    cartHasHydrated
      ? cartQuantity
      : 0;

  function isNavigationLinkActive(
    href: string,
  ): boolean {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href,
    );
  }

  function closeMobileMenu() {
    setMobileMenuIsOpen(
      false,
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <Container>
        <nav
          className="flex h-16 items-center justify-between"
          aria-label="Primary navigation"
        >
          <Link
            href="/"
            onClick={
              closeMobileMenu
            }
            className="text-2xl font-bold tracking-wide text-red-600"
          >
            HotLap
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navigationLinks.map(
              (link) => {
                const isActive =
                  isNavigationLinkActive(
                    link.href,
                  );

                return (
                  <Link
                    key={
                      link.href
                    }
                    href={
                      link.href
                    }
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      "text-sm font-medium transition",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {
                      link.label
                    }
                  </Link>
                );
              },
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/account"
              aria-label="Customer account"
              className={cn(
                buttonVariants({
                  variant:
                    "ghost",
                  size:
                    "icon",
                }),
                "hidden sm:inline-flex",
              )}
            >
              <UserRound className="h-5 w-5" />
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${visibleWishlistCount} products`}
              className={cn(
                buttonVariants({
                  variant:
                    "ghost",
                  size:
                    "icon",
                }),
                "relative",
              )}
            >
              <Heart className="h-5 w-5" />

              {wishlistHasHydrated &&
                wishlistCount >
                  0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {wishlistCount >
                    99
                      ? "99+"
                      : wishlistCount}
                  </span>
                )}
            </Link>

            <Link
              href="/cart"
              aria-label={`Cart with ${visibleCartQuantity} items`}
              className={cn(
                buttonVariants({
                  variant:
                    "ghost",
                  size:
                    "icon",
                }),
                "relative",
              )}
            >
              <ShoppingCart className="h-5 w-5" />

              {cartHasHydrated &&
                cartQuantity >
                  0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {cartQuantity >
                    99
                      ? "99+"
                      : cartQuantity}
                  </span>
                )}
            </Link>

            <button
              type="button"
              aria-label={
                mobileMenuIsOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={
                mobileMenuIsOpen
              }
              aria-controls="mobile-navigation"
              onClick={() =>
                setMobileMenuIsOpen(
                  (
                    currentValue,
                  ) =>
                    !currentValue,
                )
              }
              className={cn(
                buttonVariants({
                  variant:
                    "ghost",
                  size:
                    "icon",
                }),
                "md:hidden",
              )}
            >
              {mobileMenuIsOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>

        {mobileMenuIsOpen && (
          <div
            id="mobile-navigation"
            className="border-t py-4 md:hidden"
          >
            <nav
              className="flex flex-col gap-1"
              aria-label="Mobile navigation"
            >
              {navigationLinks.map(
                (link) => {
                  const isActive =
                    isNavigationLinkActive(
                      link.href,
                    );

                  return (
                    <Link
                      key={
                        link.href
                      }
                      href={
                        link.href
                      }
                      onClick={
                        closeMobileMenu
                      }
                      aria-current={
                        isActive
                          ? "page"
                          : undefined
                      }
                      className={cn(
                        "rounded-xl px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {
                        link.label
                      }
                    </Link>
                  );
                },
              )}

              <Link
                href="/account"
                onClick={
                  closeMobileMenu
                }
                className={cn(
                  "mt-2 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium",
                  pathname.startsWith(
                    "/account",
                  )
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <UserRound className="h-4 w-4" />

                Customer Account
              </Link>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}