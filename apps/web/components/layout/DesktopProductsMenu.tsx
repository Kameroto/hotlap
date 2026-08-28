"use client";

import Link from "next/link";

import {
  ChevronDown,
  PackageSearch,
} from "lucide-react";

import {
  useEffect,
  useRef,
  type RefObject,
} from "react";

import {
  cn,
} from "@/lib/utils";

import type {
  Category,
} from "@/lib/api/types";

type DesktopProductsMenuProps = {
  categories: Category[];
  isOpen: boolean;
  pathname: string;
  onOpenChange: (
    isOpen: boolean,
  ) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function DesktopProductsMenu({
  categories,
  isOpen,
  pathname,
  onOpenChange,
  triggerRef,
}: DesktopProductsMenuProps) {
  const rootRef =
    useRef<HTMLDivElement>(null);

  const firstLinkRef =
    useRef<HTMLAnchorElement>(null);

  const productsAreActive =
    pathname.startsWith(
      "/products",
    );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(
          event.target,
        )
      ) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      onOpenChange(false);

      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    onOpenChange,
    triggerRef,
  ]);

  function openMenu() {
    onOpenChange(true);

    requestAnimationFrame(() => {
      firstLinkRef.current?.focus();
    });
  }

  return (
    <div
      ref={rootRef}
      className="relative flex h-full items-center"
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget,
          )
        ) {
          onOpenChange(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="desktop-products-menu"
        onClick={() => {
          if (isOpen) {
            onOpenChange(false);
          } else {
            openMenu();
          }
        }}
        onKeyDown={(event) => {
          if (
            !isOpen &&
            event.key ===
              "ArrowDown"
          ) {
            event.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          "relative flex h-full items-center gap-1.5 text-sm font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset",
          productsAreActive ||
            isOpen
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Products

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-300 motion-reduce:transition-none",
            isOpen &&
              "rotate-180",
          )}
        />

        <span
          className={cn(
            "absolute inset-x-0 bottom-0 mx-auto h-[2px] bg-primary transition-all duration-300 motion-reduce:transition-none",
            productsAreActive ||
              isOpen
              ? "w-full opacity-100"
              : "w-0 opacity-0",
          )}
        />
      </button>

      {isOpen && (
        <div
          id="desktop-products-menu"
          className="absolute top-full left-0 w-[22rem] overflow-hidden rounded-b-2xl border border-t-0 border-white/10 bg-[#0b0e11]/98 p-3 shadow-[0_28px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          <p className="hotlap-kicker px-3 pt-2 pb-3">
            Shop HotLap
          </p>

          <div className="grid gap-1">
            <ProductMenuLink
              ref={firstLinkRef}
              href="/products"
              label="All Products"
              detail="Browse the complete catalogue"
              onClick={() => {
                onOpenChange(false);
              }}
            />

            {categories.map(
              (category) => (
                <ProductMenuLink
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(
                    category.slug,
                  )}`}
                  label={category.name}
                  detail={`${category.productCount} ${category.productCount === 1 ? "product" : "products"}`}
                  onClick={() => {
                    onOpenChange(false);
                  }}
                />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type ProductMenuLinkProps = {
  href: string;
  label: string;
  detail: string;
  onClick: () => void;
};

function ProductMenuLink({
  ref,
  href,
  label,
  detail,
  onClick,
}: ProductMenuLinkProps & {
  ref?: RefObject<HTMLAnchorElement | null>;
}) {
  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className="group flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 outline-none transition-colors hover:bg-primary/[0.07] focus-visible:bg-primary/[0.07] focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.06] text-primary">
        <PackageSearch
          aria-hidden="true"
          className="size-4"
        />
      </span>

      <span className="min-w-0">
        <span className="block font-semibold text-foreground transition-colors group-hover:text-primary">
          {label}
        </span>

        <span className="hotlap-supporting-text mt-0.5 block text-muted-foreground">
          {detail}
        </span>
      </span>
    </Link>
  );
}
