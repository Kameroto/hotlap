"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ProductRecommendations from "@/components/products/ProductRecommendations";

import {
  getProductBySlug,
} from "@/lib/api/client";

import {
  readRecentlyViewed,
  RECENTLY_VIEWED_STORAGE_KEY,
  RECENTLY_VIEWED_UPDATE_EVENT,
} from "@/lib/recently-viewed";

import type {
  Product,
} from "@/types/product";

type RecentlyViewedProductsProps = {
  currentProductSlug: string;
};

const DISPLAY_LIMIT = 4;

export default function RecentlyViewedProducts({
  currentProductSlug,
}: RecentlyViewedProductsProps) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const loadProducts =
    useCallback(async () => {
      const entries =
        readRecentlyViewed()
          .filter(
            (entry) =>
              entry.slug !==
              currentProductSlug,
          )
          .slice(
            0,
            DISPLAY_LIMIT,
          );

      if (
        entries.length === 0
      ) {
        setProducts([]);
        return;
      }

      const responses =
        await Promise.allSettled(
          entries.map(
            (entry) =>
              getProductBySlug(
                entry.slug,
              ),
          ),
        );

      const liveProducts =
        responses.flatMap(
          (response) =>
            response.status ===
            "fulfilled"
              ? [
                  response.value
                    .product,
                ]
              : [],
        );

      setProducts(
        liveProducts.filter(
          (product) =>
            product.slug !==
            currentProductSlug,
        ),
      );
    }, [currentProductSlug]);

  useEffect(() => {
    const initialLoadId =
      window.setTimeout(
        () => {
          void loadProducts();
        },
        0,
      );

    function handleStorage(
      event: StorageEvent,
    ) {
      if (
        event.key ===
        RECENTLY_VIEWED_STORAGE_KEY
      ) {
        void loadProducts();
      }
    }

    function handleUpdate() {
      void loadProducts();
    }

    window.addEventListener(
      "storage",
      handleStorage,
    );
    window.addEventListener(
      RECENTLY_VIEWED_UPDATE_EVENT,
      handleUpdate,
    );

    return () => {
      window.clearTimeout(
        initialLoadId,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );
      window.removeEventListener(
        RECENTLY_VIEWED_UPDATE_EVENT,
        handleUpdate,
      );
    };
  }, [loadProducts]);

  return (
    <ProductRecommendations
      eyebrow="Your Garage Trail"
      title="Recently Viewed."
      description="Products you explored recently, refreshed from the live catalogue."
      products={
        products
      }
    />
  );
}
