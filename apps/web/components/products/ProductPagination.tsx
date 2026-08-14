"use client";

import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type {
  MouseEvent,
} from "react";

import {
  buildProductCatalogueUrl,
} from "@/lib/product-catalog-query";

import type {
  ProductListResponse,
} from "@/types/product";

import type {
  ProductCatalogueQuery,
} from "@/types/product-catalog";

type ProductPaginationProps = {
  pagination:
    ProductListResponse["pagination"];

  query:
    ProductCatalogueQuery;
};

type PaginationItem =
  | number
  | "ellipsis-left"
  | "ellipsis-right";

function createPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) =>
        index + 1,
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis-right",
      totalPages,
    ];
  }

  if (
    currentPage >=
    totalPages - 3
  ) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-left",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-right",
    totalPages,
  ];
}

export default function ProductPagination({
  pagination,
  query,
}: ProductPaginationProps) {
  if (
    pagination.totalPages <=
    1
  ) {
    return null;
  }

  const paginationItems =
    createPaginationItems(
      pagination.page,
      pagination.totalPages,
    );

  function handlePaginationClick(
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const resultsHeading =
      document.getElementById(
        "product-results",
      );

    resultsHeading?.scrollIntoView({
      behavior:
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches
          ? "auto"
          : "smooth",
      block: "start",
    });
  }

  const navigationClassName =
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/45 hover:bg-primary/[0.055] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

  const disabledNavigationClassName =
    "inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/8 px-3 text-sm font-medium text-muted-foreground opacity-45";

  return (
    <nav
      className="mt-12"
      aria-label="Product pagination"
    >
      <div className="flex items-center justify-center gap-3 sm:hidden">
        {pagination.hasPreviousPage ? (
          <Link
            href={buildProductCatalogueUrl({
              ...query,
              page:
                pagination.page -
                1,
            })}
            onClick={
              handlePaginationClick
            }
            aria-label="Go to previous product page"
            className={
              navigationClassName
            }
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={
              disabledNavigationClassName
            }
          >
            <ChevronLeft className="size-4" />
          </span>
        )}

        <span className="min-w-28 text-center text-sm font-semibold text-foreground">
          Page {pagination.page} of{" "}
          {pagination.totalPages}
        </span>

        {pagination.hasNextPage ? (
          <Link
            href={buildProductCatalogueUrl({
              ...query,
              page:
                pagination.page +
                1,
            })}
            onClick={
              handlePaginationClick
            }
            aria-label="Go to next product page"
            className={
              navigationClassName
            }
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={
              disabledNavigationClassName
            }
          >
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>

      <div className="hidden flex-wrap items-center justify-center gap-2 sm:flex">
        {pagination.hasPreviousPage ? (
          <Link
            href={buildProductCatalogueUrl({
              ...query,

              page:
                pagination.page -
                1,
            })}
            onClick={
              handlePaginationClick
            }
            aria-label="Go to previous product page"
            className={
              navigationClassName
            }
          >
            <ChevronLeft className="h-4 w-4" />

            <span>
              Previous
            </span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={
              disabledNavigationClassName
            }
          >
            <ChevronLeft className="h-4 w-4" />

            <span>
              Previous
            </span>
          </span>
        )}

        {paginationItems.map(
        (item) => {
          if (
            item ===
              "ellipsis-left" ||
            item ===
              "ellipsis-right"
          ) {
            return (
              <span
                key={item}
                aria-hidden="true"
                className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            );
          }

          const isCurrentPage =
            item ===
            pagination.page;

          return (
            isCurrentPage ? (
              <span
                key={item}
                aria-current="page"
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-primary bg-primary px-3 text-sm font-semibold text-primary-foreground"
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={buildProductCatalogueUrl({
                  ...query,
                  page: item,
                })}
                onClick={
                  handlePaginationClick
                }
                aria-label={`Go to product page ${item}`}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] px-3 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/45 hover:bg-primary/[0.055] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                {item}
              </Link>
            )
          );
        },
        )}

        {pagination.hasNextPage ? (
        <Link
          href={buildProductCatalogueUrl({
            ...query,

            page:
              pagination.page +
              1,
          })}
          onClick={
            handlePaginationClick
          }
          aria-label="Go to next product page"
          className={
            navigationClassName
          }
        >
          <span>
            Next
          </span>

          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={
            disabledNavigationClassName
          }
        >
          <span>
            Next
          </span>

          <ChevronRight className="h-4 w-4" />
        </span>
        )}
      </div>
    </nav>
  );
}
