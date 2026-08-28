"use client";

import Link from "next/link";

import {
  CalendarDays,
  Heart,
  House,
  Info,
  Mail,
  Search,
  ShoppingCart,
  Store,
  UserRound,
  X,
} from "lucide-react";

import type {
  ReactNode,
  RefObject,
} from "react";

import SiteOverlay from "@/components/layout/SiteOverlay";

import {
  Button,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

import type {
  Category,
} from "@/lib/api/types";

type MobileNavigationProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  pathname: string;
  categories: Category[];
  cartQuantity: number;
  wishlistCount: number;
};

const mainLinks = [
  {
    href: "/",
    label: "Home",
    icon: House,
  },
  {
    href: "/events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    href: "/about",
    label: "About",
    icon: Info,
  },
  {
    href: "/contact",
    label: "Contact",
    icon: Mail,
  },
];

export default function MobileNavigation({
  open,
  onClose,
  triggerRef,
  pathname,
  categories,
  cartQuantity,
  wishlistCount,
}: MobileNavigationProps) {
  return (
    <SiteOverlay
      id="mobile-navigation"
      open={open}
      onClose={onClose}
      triggerRef={triggerRef}
      labelledBy="mobile-navigation-title"
      panelClassName="lg:hidden"
    >
      <div className="flex min-h-full flex-col pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="hotlap-kicker">
              HotLap
            </p>

            <h2
              id="mobile-navigation-title"
              className="mt-1 text-xl"
            >
              Menu
            </h2>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            autoFocus
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 px-5 py-5">
          <form
            action="/products"
            method="get"
            onSubmit={onClose}
          >
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />

              <label
                htmlFor="mobile-product-search"
                className="sr-only"
              >
                Search HotLap products
              </label>

              <input
                id="mobile-product-search"
                name="search"
                type="search"
                placeholder="Search products..."
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pr-4 pl-11 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/75 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/25 motion-reduce:transition-none"
              />
            </div>
          </form>

          <nav
            className="mt-6"
            aria-label="Mobile navigation"
          >
            <p className="hotlap-kicker px-3">
              Explore
            </p>

            <div className="mt-2 grid gap-1">
              {mainLinks.map(
                ({
                  href,
                  label,
                  icon: Icon,
                }) => (
                  <MobileLink
                    key={href}
                    href={href}
                    label={label}
                    active={
                      href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(
                            href,
                          )
                    }
                    onClick={onClose}
                    icon={
                      <Icon className="size-4" />
                    }
                  />
                ),
              )}
            </div>

            <div className="my-6 border-t border-white/10" />

            <p className="hotlap-kicker px-3">
              Shop
            </p>

            <div className="mt-2 grid gap-1">
              <MobileLink
                href="/products"
                label="All Products"
                active={
                  pathname.startsWith(
                    "/products",
                  )
                }
                onClick={onClose}
                icon={
                  <Store className="size-4" />
                }
              />

              {categories.map(
                (category) => (
                  <MobileLink
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(
                      category.slug,
                    )}`}
                    label={category.name}
                    detail={`${category.productCount}`}
                    active={false}
                    onClick={onClose}
                  />
                ),
              )}
            </div>

            <div className="my-6 border-t border-white/10" />

            <p className="hotlap-kicker px-3">
              Your HotLap
            </p>

            <div className="mt-2 grid gap-1">
              <MobileLink
                href="/account"
                label="Customer Account"
                active={
                  pathname.startsWith(
                    "/account",
                  )
                }
                onClick={onClose}
                icon={
                  <UserRound className="size-4" />
                }
              />

              <MobileLink
                href="/wishlist"
                label="Wishlist"
                detail={
                  wishlistCount > 0
                    ? `${wishlistCount}`
                    : undefined
                }
                active={
                  pathname.startsWith(
                    "/wishlist",
                  )
                }
                onClick={onClose}
                icon={
                  <Heart className="size-4" />
                }
              />

              <MobileLink
                href="/cart"
                label="Cart"
                detail={
                  cartQuantity > 0
                    ? `${cartQuantity}`
                    : undefined
                }
                active={
                  pathname.startsWith(
                    "/cart",
                  )
                }
                onClick={onClose}
                icon={
                  <ShoppingCart className="size-4" />
                }
              />
            </div>
          </nav>
        </div>
      </div>
    </SiteOverlay>
  );
}

type MobileLinkProps = {
  href: string;
  label: string;
  detail?: string;
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
};

function MobileLink({
  href,
  label,
  detail,
  active,
  onClick,
  icon,
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none",
        active
          ? "border-primary bg-primary/[0.08] text-foreground"
          : "border-transparent text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
      )}
    >
      {icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-primary">
          {icon}
        </span>
      )}

      <span className="min-w-0 flex-1">
        {label}
      </span>

      {detail && (
        <span className="flex min-w-6 items-center justify-center rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {detail}
        </span>
      )}
    </Link>
  );
}
