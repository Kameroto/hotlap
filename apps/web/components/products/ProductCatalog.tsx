"use client";

import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import ProductCategoryFilter from "@/components/products/ProductCategoryFilter";
import ProductPagination from "@/components/products/ProductPagination";
import ProductSearch from "@/components/products/ProductSearch";
import ProductSort from "@/components/products/ProductSort";

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

  return (
    <div className="mt-10">
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

      <div className="mt-8 flex flex-col gap-4 border-y py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination.totalItems}{" "}
          {pagination.totalItems ===
          1
            ? "product"
            : "products"}{" "}
          found
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {filtersAreActive && (
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
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

      {products.length >
      0 ? (
        <>
          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="mt-8 rounded-2xl border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">
            No matching products
          </h2>

          <p className="mt-2 text-muted-foreground">
            Try changing your
            search term or
            category.
          </p>

          <Link
            href="/products"
            className="mt-5 inline-block rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}