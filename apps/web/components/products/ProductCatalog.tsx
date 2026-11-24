"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState, useTransition } from "react";

import {
  SlidersHorizontal,
} from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import ProductCategoryFilter from "@/components/products/ProductCategoryFilter";
import ProductPagination from "@/components/products/ProductPagination";
import ProductSearch, {
  type ProductSearchHandle,
} from "@/components/products/ProductSearch";
import ProductSort from "@/components/products/ProductSort";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

import type {
  Product,
  ProductListResponse,
} from "@/types/product";

import type {
  ProductCatalogueQuery,
} from "@/types/product-catalog";

type CategoryOption = {
  value: string;
  label: string;
};

type ProductCatalogProps = {
  products: Product[];

  pagination:
    ProductListResponse["pagination"];

  query:
    ProductCatalogueQuery;

  categories:
    CategoryOption[];
};

export default function ProductCatalog({
  products,
  pagination,
  query,
  categories,
}: ProductCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useRef<ProductSearchHandle>(null);
  const pendingFilter = useRef<{ href: string; generation: number } | null>(null);
  const filterGeneration = useRef(0);
  const [renderedFilterGeneration, setRenderedFilterGeneration] = useState(0);
  const [filterIsPending, startFilterTransition] = useTransition();

  const isFilterNavigationPending = useCallback(() => pendingFilter.current !== null, []);

  const cancelCatalogueWork = useCallback(() => {
    pendingFilter.current = null;
    search.current?.cancelPendingSearch();
  }, []);

  useLayoutEffect(() => {
    window.addEventListener("popstate", cancelCatalogueWork);
    return () => window.removeEventListener("popstate", cancelCatalogueWork);
  }, [cancelCatalogueWork]);

  useLayoutEffect(() => {
    const intent = pendingFilter.current;
    if (filterIsPending || intent?.generation !== renderedFilterGeneration) return;

    // The transition can settle at a redirected URL or without changing the URL.
    pendingFilter.current = null;
    search.current?.settleFilterNavigation();
  }, [renderedFilterGeneration, filterIsPending]);

  function navigateFilter(filter: "category" | "sort", value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.sort();
    const committedQuery = params.toString();
    const committedHref = committedQuery ? `${pathname}?${committedQuery}` : pathname;
    const intent = pendingFilter.current;

    if (intent) {
      // Carry forward the other filter even when its push has not committed yet.
      const pendingParams = new URL(intent.href, window.location.origin).searchParams;
      const otherFilter = filter === "category" ? "sort" : "category";
      const otherValue = pendingParams.get(otherFilter);
      if (otherValue === null) params.delete(otherFilter);
      else params.set(otherFilter, otherValue);
    }

    if (value === undefined) params.delete(filter);
    else params.set(filter, value);
    params.delete("page");
    params.sort();
    const queryString = params.toString();
    const href = queryString ? `${pathname}?${queryString}` : pathname;
    if (href === (intent?.href ?? committedHref)) return;

    const generation = ++filterGeneration.current;
    pendingFilter.current = { href, generation };
    startFilterTransition(() => {
      setRenderedFilterGeneration(generation);
      router.push(href);
    });
  }

  const filtersAreActive =
    Boolean(
      query.search ||
        query.category ||
        (
          query.sort &&
          query.sort !==
            "featured"
        ),
    );

  const selectedCategoryLabel =
    categories
      .find(
        (category) =>
          category.value ===
          query.category,
      )
      ?.label.replace(
        /\s+\(\d+\)$/,
        "",
      );

  const emptyStateDescription =
    query.search &&
    selectedCategoryLabel
      ? `No products matched “${query.search}” in ${selectedCategoryLabel}. Try a different search or category.`
      : query.search
        ? `No products matched “${query.search}”. Try a broader product name, brand, or SKU.`
        : selectedCategoryLabel
          ? `There are no products available in ${selectedCategoryLabel} for the current filters.`
          : "No products match the current filters. Try adjusting or clearing them.";

  return (
    <div className="mt-10">
      <div className="rounded-2xl border border-white/8 bg-[#101316]/70 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] sm:p-5">
        <ProductSearch ref={search} isFilterNavigationPending={isFilterNavigationPending} />

        <ProductCategoryFilter
          onSelect={category => navigateFilter("category", category)}
          categories={
            categories
          }
          selectedCategory={
            query.category ??
            "all"
          }
        />
      </div>

      <div
        id="product-results"
        className="mt-7 scroll-mt-24 border-y border-white/8 py-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4 text-primary" />

            <span>
              <strong className="font-semibold text-foreground">
                {
                  pagination.totalItems
                }
              </strong>{" "}
              {pagination.totalItems ===
              1
                ? "product"
                : "products"}{" "}
              found
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center sm:w-auto sm:gap-4">
            {filtersAreActive && (
              <Link
                href="/products"
                onNavigate={cancelCatalogueWork}
                className="w-fit rounded-md text-sm font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                Clear filters
              </Link>
            )}

            <ProductSort
              onSelect={sort => navigateFilter("sort", sort)}
              value={
                query.sort ??
                "featured"
              }
            />
          </div>
        </div>
      </div>

      {products.length >
      0 ? (
        <>
          <div className="mt-8 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map(
              (product) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                />
              ),
            )}
          </div>

          <ProductPagination
            pagination={
              pagination
            }
            query={
              query
            }
          />
        </>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-dashed border-white/12 bg-[#101316] px-6 py-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
            <SlidersHorizontal className="size-6" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            No matching products
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            {
              emptyStateDescription
            }
          </p>

          <Link
            href="/products"
            onNavigate={cancelCatalogueWork}
            className={cn(
              buttonVariants({
                variant:
                  "outline",
                size:
                  "lg",
              }),
              "mt-7 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}
