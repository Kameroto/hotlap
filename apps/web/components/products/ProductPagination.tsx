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

  const pageNumbers =
    Array.from(
      {
        length:
          pagination.totalPages,
      },
      (
        _,
        index,
      ) =>
        index + 1,
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
          className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border px-3 text-sm font-medium text-muted-foreground opacity-50">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </span>
      )}

      {pageNumbers.map(
        (pageNumber) => {
          const isCurrentPage =
            pageNumber ===
            pagination.page;

          return (
            <Link
              key={
                pageNumber
              }
              href={buildProductCatalogueUrl({
                ...query,
                page:
                  pageNumber,
              })}
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
              {
                pageNumber
              }
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
          className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border px-3 text-sm font-medium text-muted-foreground opacity-50">
          Next
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}