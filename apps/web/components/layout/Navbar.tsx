"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import Container from "@/components/layout/Container";
import DesktopProductsMenu from "@/components/layout/DesktopProductsMenu";
import MobileNavigation from "@/components/layout/MobileNavigation";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

import type {
  Category,
} from "@/lib/api/types";

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

type NavbarProps = {
  categories: Category[];
};

export default function Navbar({
  categories,
}: NavbarProps) {
  const pathname =
    usePathname();

  const [
    mobileMenuIsOpen,
    setMobileMenuIsOpen,
  ] = useState(false);

  const [
    productsMenuIsOpen,
    setProductsMenuIsOpen,
  ] = useState(false);

  const mobileMenuTriggerRef =
    useRef<HTMLButtonElement>(null);

  const productsMenuTriggerRef =
    useRef<HTMLButtonElement>(null);

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

  const closeMobileMenu =
    useCallback(() => {
      setMobileMenuIsOpen(
        false,
      );
    }, []);

  const setProductsMenuOpen =
    useCallback(
      (isOpen: boolean) => {
        setProductsMenuIsOpen(
          isOpen,
        );
      },
      [],
    );

  useEffect(() => {
    const frame =
      requestAnimationFrame(() => {
        closeMobileMenu();
        setProductsMenuIsOpen(
          false,
        );
      });

    return () => {
      cancelAnimationFrame(
        frame,
      );
    };
  }, [
    closeMobileMenu,
    pathname,
  ]);

  useEffect(() => {
    const desktopMediaQuery =
      window.matchMedia(
        "(min-width: 1024px)",
      );

    function synchronizeNavigation(
      event: MediaQueryListEvent,
    ) {
      if (event.matches) {
        closeMobileMenu();
      } else {
        setProductsMenuIsOpen(
          false,
        );
      }
    }

    desktopMediaQuery.addEventListener(
      "change",
      synchronizeNavigation,
    );

    return () => {
      desktopMediaQuery.removeEventListener(
        "change",
        synchronizeNavigation,
      );
    };
  }, [closeMobileMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#080a0c]/92 shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <Container>
        <nav
          className="flex h-[var(--hotlap-navbar-height)] items-center gap-6"
          aria-label="Primary navigation"
        >
          <Link
            href="/"
            onClick={
              closeMobileMenu
            }
            aria-label="HotLap home"
            className="group shrink-0"
          >
            <span className="flex items-center font-heading text-[1.55rem] font-bold italic tracking-[-0.07em] text-foreground sm:text-[1.7rem]">
              HOTL
              <span className="relative text-primary">
                A
                <span className="absolute -right-[0.06em] bottom-[0.13em] h-[2px] w-[70%] bg-primary transition-all duration-300 group-hover:w-full" />
              </span>
              P
            </span>
          </Link>

          <div className="hidden h-full items-center gap-7 lg:flex">
            {navigationLinks.map(
              (link) => {
                if (
                  link.href ===
                  "/products"
                ) {
                  return (
                    <DesktopProductsMenu
                      key={link.href}
                      categories={categories}
                      isOpen={
                        productsMenuIsOpen
                      }
                      pathname={pathname}
                      onOpenChange={
                        setProductsMenuOpen
                      }
                      triggerRef={
                        productsMenuTriggerRef
                      }
                    />
                  );
                }

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
                      "relative flex h-full items-center text-sm font-semibold transition-colors duration-300",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {
                      link.label
                    }

                    <span
                      className={cn(
                        "absolute inset-x-0 bottom-0 mx-auto h-[2px] bg-primary transition-all duration-300",
                        isActive
                          ? "w-full opacity-100"
                          : "w-0 opacity-0",
                      )}
                    />
                  </Link>
                );
              },
            )}
          </div>

          <form
            action="/products"
            method="get"
            className="ml-auto hidden min-w-0 flex-1 justify-end xl:flex"
          >
            <div className="relative w-full max-w-[370px]">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />

              <label
                htmlFor="navbar-product-search"
                className="sr-only"
              >
                Search HotLap products
              </label>

              <input
                id="navbar-product-search"
                name="search"
                type="search"
                placeholder="Search RC cars, parts & more..."
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.035] pr-4 pl-11 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground/70 hover:border-white/18 focus:border-primary/70 focus:bg-white/[0.05] focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </form>

          <div
            className={cn(
              "flex items-center gap-1",
              "xl:ml-2",
              "lg:ml-auto xl:ml-2",
            )}
          >
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
                "hidden border-white/0 text-muted-foreground hover:text-foreground sm:inline-flex",
              )}
            >
              <UserRound className="size-[1.15rem]" />
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
                "relative border-white/0 text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className="size-[1.15rem]" />

              {wishlistHasHydrated &&
                wishlistCount >
                  0 && (
                  <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[0.62rem] font-bold leading-none text-primary-foreground">
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
                "relative border-white/0 text-muted-foreground hover:text-foreground",
              )}
            >
              <ShoppingCart className="size-[1.15rem]" />

              {cartHasHydrated &&
                cartQuantity >
                  0 && (
                  <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[0.62rem] font-bold leading-none text-primary-foreground">
                    {cartQuantity >
                    99
                      ? "99+"
                      : cartQuantity}
                  </span>
                )}
            </Link>

            <button
              ref={mobileMenuTriggerRef}
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
                {
                  setProductsMenuIsOpen(
                    false,
                  );

                  setMobileMenuIsOpen(
                    (
                      currentValue,
                    ) =>
                      !currentValue,
                  );
                }
              }
              className={cn(
                buttonVariants({
                  variant:
                    "ghost",
                  size:
                    "icon",
                }),
                "border-white/0 text-muted-foreground hover:text-foreground lg:hidden",
              )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </Container>

      <MobileNavigation
        open={mobileMenuIsOpen}
        onClose={closeMobileMenu}
        triggerRef={
          mobileMenuTriggerRef
        }
        pathname={pathname}
        categories={categories}
        cartQuantity={
          visibleCartQuantity
        }
        wishlistCount={
          visibleWishlistCount
        }
      />
    </header>
  );
}
