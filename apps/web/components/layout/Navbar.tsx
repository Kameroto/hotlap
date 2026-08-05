"use client";

import Link from "next/link";

import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import Container from "@/components/layout/Container";

import {
  buttonVariants,
} from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

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
  const wishlistCount = useWishlistStore(
    (state) =>
      state.wishlistProductIds.length,
  );

  const wishlistHasHydrated =
    useWishlistStore(
      (state) => state.hasHydrated,
    );

  const cartItems = useCartStore(
    (state) => state.items,
  );

  const cartHasHydrated = useCartStore(
    (state) => state.hasHydrated,
  );

  const cartQuantity = cartItems.reduce(
    (totalQuantity, item) =>
      totalQuantity + item.quantity,
    0,
  );

  const visibleWishlistCount =
    wishlistHasHydrated
      ? wishlistCount
      : 0;

  const visibleCartQuantity =
    cartHasHydrated
      ? cartQuantity
      : 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide text-red-600"
          >
            HotLap
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${visibleWishlistCount} products`}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon",
                }),
                "relative",
              )}
            >
              <Heart className="h-5 w-5" />

              {wishlistHasHydrated &&
                wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {wishlistCount > 99
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
                  variant: "ghost",
                  size: "icon",
                }),
                "relative",
              )}
            >
              <ShoppingCart className="h-5 w-5" />

              {cartHasHydrated &&
                cartQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {cartQuantity > 99
                      ? "99+"
                      : cartQuantity}
                  </span>
                )}
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}