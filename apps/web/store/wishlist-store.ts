import { create } from "zustand";

import {
  ApiClientError,
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
} from "@/lib/api/client";

import type {
  WishlistItem,
} from "@/lib/api/types";

type WishlistState = {
  items: WishlistItem[];

  hasHydrated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  refreshWishlist: () => Promise<void>;

  isInWishlist: (
    productId: string,
  ) => boolean;

  addToWishlist: (
    productId: string,
  ) => Promise<void>;

  removeFromWishlist: (
    productId: string,
  ) => Promise<void>;

  toggleWishlist: (
    productId: string,
  ) => Promise<void>;

  clearWishlist: () => Promise<void>;

  clearLocalWishlist: () => void;

  setHasHydrated: (
    hasHydrated: boolean,
  ) => void;
};

let initializationPromise:
  | Promise<void>
  | null = null;

export const useWishlistStore =
  create<WishlistState>()(
    (set, get) => ({
      items: [],

      hasHydrated: false,
      isLoading: false,

      initialize: async () => {
        if (
          get().hasHydrated
        ) {
          return;
        }

        if (
          initializationPromise
        ) {
          return initializationPromise;
        }

        initializationPromise =
          (async () => {
            set({
              isLoading: true,
            });

            try {
              const wishlist =
                await getWishlist();

              set({
                items:
                  wishlist.items,

                hasHydrated:
                  true,
              });
            } catch (error) {
              if (
                error instanceof
                  ApiClientError &&
                error.statusCode ===
                  401
              ) {
                set({
                  items: [],
                  hasHydrated:
                    true,
                });

                return;
              }

              throw error;
            } finally {
              set({
                isLoading: false,
              });

              initializationPromise =
                null;
            }
          })();

        return initializationPromise;
      },

      refreshWishlist:
        async () => {
          set({
            isLoading: true,
          });

          try {
            const wishlist =
              await getWishlist();

            set({
              items:
                wishlist.items,

              hasHydrated:
                true,
            });
          } catch (error) {
            if (
              error instanceof
                ApiClientError &&
              error.statusCode ===
                401
            ) {
              set({
                items: [],
                hasHydrated:
                  true,
              });

              return;
            }

            throw error;
          } finally {
            set({
              isLoading: false,
            });
          }
        },

      isInWishlist: (
        productId,
      ) =>
        get().items.some(
          (item) =>
            item.product.id ===
            productId,
        ),

      addToWishlist:
        async (
          productId,
        ) => {
          set({
            isLoading: true,
          });

          try {
            const wishlist =
              await addWishlistItem({
                productId,
              });

            set({
              items:
                wishlist.items,

              hasHydrated:
                true,
            });
          } finally {
            set({
              isLoading: false,
            });
          }
        },

      removeFromWishlist:
        async (
          productId,
        ) => {
          set({
            isLoading: true,
          });

          try {
            const wishlist =
              await removeWishlistItem(
                productId,
              );

            set({
              items:
                wishlist.items,

              hasHydrated:
                true,
            });
          } finally {
            set({
              isLoading: false,
            });
          }
        },

      toggleWishlist:
        async (
          productId,
        ) => {
          const productIsSaved =
            get().isInWishlist(
              productId,
            );

          if (
            productIsSaved
          ) {
            await get().removeFromWishlist(
              productId,
            );

            return;
          }

          await get().addToWishlist(
            productId,
          );
        },

      clearWishlist:
        async () => {
          const productIds =
            get().items.map(
              (item) =>
                item.product.id,
            );

          set({
            isLoading: true,
          });

          try {
            for (
              const productId of
              productIds
            ) {
              const wishlist =
                await removeWishlistItem(
                  productId,
                );

              set({
                items:
                  wishlist.items,
              });
            }

            set({
              items: [],
              hasHydrated:
                true,
            });
          } finally {
            set({
              isLoading: false,
            });
          }
        },

      clearLocalWishlist: () => {
        set({
          items: [],
          hasHydrated:
            true,
        });
      },

      setHasHydrated: (
        hasHydrated,
      ) => {
        set({
          hasHydrated,
        });
      },
    }),
  );