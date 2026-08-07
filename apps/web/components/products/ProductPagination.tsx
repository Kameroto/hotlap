"use client";

import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label="Product pagination"
    >
      {pagination.hasPreviousPage ? (
        <Link
          href={buildProductCatalogueUrl({
            ...query,

            page:
              pagination.page -
              1,
          })}
          aria-label="Go to previous product page"
          className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />

          <span className="hidden sm:inline">
            Previous
          </span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border px-3 text-sm font-medium text-muted-foreground opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />

          <span className="hidden sm:inline">
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
            <Link
              key={item}
              href={buildProductCatalogueUrl({
                ...query,
                page: item,
              })}
              aria-label={`Go to product page ${item}`}
              aria-current={
                isCurrentPage
                  ? "page"
                  : undefined
              }
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition ${
                isCurrentPage
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {item}
            </Link>
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
          aria-label="Go to next product page"
          className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
        >
          <span className="hidden sm:inline">
            Next
          </span>

          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border px-3 text-sm font-medium text-muted-foreground opacity-50"
        >
          <span className="hidden sm:inline">
            Next
          </span>

          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}