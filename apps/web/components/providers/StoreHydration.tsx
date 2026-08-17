"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  useAuthStore,
} from "@/store/auth-store";

import {
  useCartStore,
} from "@/store/cart-store";

import {
  useWishlistStore,
} from "@/store/wishlist-store";

type StoreHydrationProps = {
  children: ReactNode;
};

export default function StoreHydration({
  children,
}: StoreHydrationProps) {
  const authStatus =
    useAuthStore(
      (state) =>
        state.status,
    );

  const authHasInitialized =
    useAuthStore(
      (state) =>
        state.hasInitialized,
    );

  useEffect(() => {
    async function initializeAuthentication() {
      try {
        await useAuthStore
          .getState()
          .initialize();
      } catch (error) {
        console.error(
          "Authentication initialization failed:",
          error,
        );
      }
    }

    void initializeAuthentication();
  }, []);

  useEffect(() => {
    if (
      !authHasInitialized ||
      (authStatus !== "authenticated" &&
        authStatus !== "unauthenticated")
    ) {
      return;
    }

    async function synchronizeCustomerStores() {
      try {
        await useCartStore
          .getState()
          .refreshCart();
      } catch (error) {
        console.error(
          "Cart synchronization failed:",
          error,
        );
      }

      if (
        authStatus ===
        "authenticated"
      ) {
        try {
          await useWishlistStore
            .getState()
            .refreshWishlist();
        } catch (error) {
          console.error(
            "Wishlist synchronization failed:",
            error,
          );
        }

        return;
      }

      if (
        authStatus ===
        "unauthenticated"
      ) {
        useWishlistStore
          .getState()
          .clearLocalWishlist();
      }
    }

    void synchronizeCustomerStores();
  }, [
    authHasInitialized,
    authStatus,
  ]);

  return children;
}
