"use client";

import Link from "next/link";

import {
  SlidersHorizontal,
} from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import ProductCategoryFilter from "@/components/products/ProductCategoryFilter";
import ProductPagination from "@/components/products/ProductPagination";
import ProductSearch from "@/components/products/ProductSearch";
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
        <ProductSearch
          key={
            query.search ??
            ""
          }
          initialValue={
            query.search ??
            ""
          }
        />

        <ProductCategoryFilter
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
                className="w-fit rounded-md text-sm font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                Clear filters
              </Link>
            )}

            <ProductSort
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
