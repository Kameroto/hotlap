import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

type WishlistState = {
  wishlistProductIds: string[];
  hasHydrated: boolean;

  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  replaceWishlist: (productIds: string[]) => void;
  clearWishlist: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const WISHLIST_STORAGE_KEY =
  "hotlap-wishlist-store";

export const LEGACY_WISHLIST_STORAGE_KEY =
  "hotlap-wishlist";

export const useWishlistStore =
  create<WishlistState>()(
    persist(
      (set, get) => ({
        wishlistProductIds: [],
        hasHydrated: false,

        isInWishlist: (productId) =>
          get().wishlistProductIds.includes(productId),

        addToWishlist: (productId) => {
          set((state) => {
            if (
              state.wishlistProductIds.includes(productId)
            ) {
              return state;
            }

            return {
              wishlistProductIds: [
                ...state.wishlistProductIds,
                productId,
              ],
            };
          });
        },

        removeFromWishlist: (productId) => {
          set((state) => ({
            wishlistProductIds:
              state.wishlistProductIds.filter(
                (currentProductId) =>
                  currentProductId !== productId,
              ),
          }));
        },

        toggleWishlist: (productId) => {
          set((state) => {
            const productIsSaved =
              state.wishlistProductIds.includes(
                productId,
              );

            return {
              wishlistProductIds: productIsSaved
                ? state.wishlistProductIds.filter(
                    (currentProductId) =>
                      currentProductId !== productId,
                  )
                : [
                    ...state.wishlistProductIds,
                    productId,
                  ],
            };
          });
        },

        replaceWishlist: (productIds) => {
          set({
            wishlistProductIds: [
              ...new Set(productIds),
            ],
          });
        },

        clearWishlist: () => {
          set({
            wishlistProductIds: [],
          });
        },

        setHasHydrated: (hasHydrated) => {
          set({
            hasHydrated,
          });
        },
      }),
      {
        name: WISHLIST_STORAGE_KEY,

        storage: createJSONStorage(
          () => window.localStorage,
        ),

        partialize: (state) => ({
          wishlistProductIds:
            state.wishlistProductIds,
        }),

        skipHydration: true,
      },
    ),
  );