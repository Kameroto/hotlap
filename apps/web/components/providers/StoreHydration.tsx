"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

import {
  LEGACY_WISHLIST_STORAGE_KEY,
  WISHLIST_STORAGE_KEY,
  useWishlistStore,
} from "@/store/wishlist-store";

type StoreHydrationProps = {
  children: ReactNode;
};

function readLegacyWishlist(): string[] {
  try {
    const storedWishlist =
      window.localStorage.getItem(
        LEGACY_WISHLIST_STORAGE_KEY,
      );

    if (!storedWishlist) {
      return [];
    }

    const parsedWishlist: unknown =
      JSON.parse(storedWishlist);

    if (
      Array.isArray(parsedWishlist) &&
      parsedWishlist.every(
        (productId) =>
          typeof productId === "string",
      )
    ) {
      return parsedWishlist;
    }

    return [];
  } catch {
    return [];
  }
}

export default function StoreHydration({
  children,
}: StoreHydrationProps) {
  useEffect(() => {
    async function hydrateStores() {
      const hasNewWishlist =
        window.localStorage.getItem(
          WISHLIST_STORAGE_KEY,
        );

      if (!hasNewWishlist) {
        const legacyWishlist =
          readLegacyWishlist();

        if (legacyWishlist.length > 0) {
          useWishlistStore
            .getState()
            .replaceWishlist(
              legacyWishlist,
            );
        }
      }

      window.localStorage.removeItem(
        LEGACY_WISHLIST_STORAGE_KEY,
      );

      try {
        await Promise.all([
          Promise.resolve(
            useWishlistStore.persist.rehydrate(),
          ),

          Promise.resolve(
            useCartStore.persist.rehydrate(),
          ),
        ]);
      } finally {
        useWishlistStore
          .getState()
          .setHasHydrated(true);

        useCartStore
          .getState()
          .setHasHydrated(true);
      }

      try {
        await useAuthStore
          .getState()
          .initialize();
      } catch (error) {
        console.error(
          "Authentication hydration failed:",
          error,
        );
      }
    }

    void hydrateStores();
  }, []);

  return children;
}