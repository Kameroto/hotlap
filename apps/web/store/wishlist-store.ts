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

export type WishlistLoadStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "error";

type WishlistState = {
  items: WishlistItem[];

  hasHydrated: boolean;
  isLoading: boolean;
  loadStatus: WishlistLoadStatus;
  loadError: string | null;
  pendingProductIds: string[];

  initialize: () => Promise<void>;
  refreshWishlist: () => Promise<void>;

  isInWishlist: (
    productId: string,
  ) => boolean;

  addToWishlist: (
    productId: string,
  ) => Promise<boolean>;

  removeFromWishlist: (
    productId: string,
  ) => Promise<boolean>;

  toggleWishlist: (
    productId: string,
  ) => Promise<boolean>;

  clearWishlist: () => Promise<void>;

  clearLocalWishlist: () => void;

  setHasHydrated: (
    hasHydrated: boolean,
  ) => void;
};

let initializationPromise:
  | Promise<void>
  | null = null;

let activeProductMutations = 0;
let overlappingMutationsOccurred =
  false;

function getWishlistErrorMessage(
  error: unknown,
): string {
  return error instanceof
    ApiClientError
    ? error.message
    : "Unable to load your wishlist.";
}

export const useWishlistStore =
  create<WishlistState>()(
    (set, get) => {
      async function loadWishlist(): Promise<void> {
        set({
          isLoading: true,
          loadStatus: "loading",
          loadError: null,
        });

        try {
          const wishlist =
            await getWishlist();

          set({
            items:
              wishlist.items,
            hasHydrated: true,
            loadStatus: "loaded",
            loadError: null,
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
              hasHydrated: true,
              loadStatus: "loaded",
              loadError: null,
            });

            return;
          }

          set({
            hasHydrated: false,
            loadStatus: "error",
            loadError:
              getWishlistErrorMessage(
                error,
              ),
          });

          throw error;
        } finally {
          set({
            isLoading: false,
          });
        }
      }

      async function runProductMutation(
        productId: string,
        mutation: () => Promise<{
          items: WishlistItem[];
        }>,
      ): Promise<boolean> {
        const currentState =
          get();

        if (
          currentState.isLoading ||
          currentState.loadStatus !==
            "loaded" ||
          currentState.pendingProductIds.includes(
            productId,
          )
        ) {
          return false;
        }

        activeProductMutations +=
          1;

        if (
          activeProductMutations >
          1
        ) {
          overlappingMutationsOccurred =
            true;
        }

        set((state) => ({
          pendingProductIds: [
            ...state.pendingProductIds,
            productId,
          ],
        }));

        try {
          const wishlist =
            await mutation();

          set({
            items:
              wishlist.items,
          });

          return true;
        } finally {
          activeProductMutations =
            Math.max(
              0,
              activeProductMutations -
                1,
            );

          set((state) => ({
            pendingProductIds:
              state.pendingProductIds.filter(
                (pendingProductId) =>
                  pendingProductId !==
                  productId,
              ),
          }));

          if (
            activeProductMutations ===
              0 &&
            overlappingMutationsOccurred
          ) {
            overlappingMutationsOccurred =
              false;

            set({
              isLoading: true,
            });

            try {
              const wishlist =
                await getWishlist();

              set({
                items:
                  wishlist.items,
              });
            } catch {
              // Each completed mutation already supplied an authoritative response.
            } finally {
              set({
                isLoading: false,
              });
            }
          }
        }
      }

      return {
        items: [],

        hasHydrated: false,
        isLoading: false,
        loadStatus: "idle",
        loadError: null,
        pendingProductIds: [],

        initialize: async () => {
          if (
            get().loadStatus ===
            "loaded"
          ) {
            return;
          }

          if (
            initializationPromise
          ) {
            return initializationPromise;
          }

          initializationPromise =
            loadWishlist().finally(
              () => {
                initializationPromise =
                  null;
              },
            );

          return initializationPromise;
        },

        refreshWishlist:
          async () => {
            await loadWishlist();
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
          ) =>
            runProductMutation(
              productId,
              () =>
                addWishlistItem({
                  productId,
                }),
            ),

        removeFromWishlist:
          async (
            productId,
          ) =>
            runProductMutation(
              productId,
              () =>
                removeWishlistItem(
                  productId,
                ),
            ),

        toggleWishlist:
          async (
            productId,
          ) => {
            const currentState =
              get();

            if (
              currentState.isLoading ||
              currentState.pendingProductIds.includes(
                productId,
              )
            ) {
              return false;
            }

            return currentState.isInWishlist(
              productId,
            )
              ? currentState.removeFromWishlist(
                  productId,
                )
              : currentState.addToWishlist(
                  productId,
                );
          },

        clearWishlist:
          async () => {
            const currentState =
              get();

            if (
              currentState.isLoading ||
              currentState.pendingProductIds.length >
                0
            ) {
              return;
            }

            const productIds =
              currentState.items.map(
                (item) =>
                  item.product.id,
              );

            set({
              isLoading: true,
              loadError: null,
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
                hasHydrated: true,
                loadStatus:
                  "loaded",
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
            hasHydrated: true,
            isLoading: false,
            loadStatus: "loaded",
            loadError: null,
            pendingProductIds: [],
          });
        },

        setHasHydrated: (
          hasHydrated,
        ) => {
          set({
            hasHydrated,
          });
        },
      };
    },
  );
