import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  appliedPromotionCode: string | null;
  hasHydrated: boolean;

  addItem: (
    productId: string,
    maximumQuantity: number,
  ) => void;

  removeItem: (productId: string) => void;

  increaseQuantity: (
    productId: string,
    maximumQuantity: number,
  ) => void;

  decreaseQuantity: (
    productId: string,
  ) => void;

  setQuantity: (
    productId: string,
    quantity: number,
    maximumQuantity: number,
  ) => void;

  applyPromotionCode: (
    promotionCode: string,
  ) => void;

  removePromotionCode: () => void;

  clearCart: () => void;

  setHasHydrated: (
    hasHydrated: boolean,
  ) => void;
};

export const CART_STORAGE_KEY =
  "hotlap-cart-store";

export const useCartStore =
  create<CartState>()(
    persist(
      (set) => ({
        items: [],

        appliedPromotionCode: null,

        hasHydrated: false,

        addItem: (
          productId,
          maximumQuantity,
        ) => {
          if (maximumQuantity <= 0) {
            return;
          }

          set((state) => {
            const existingItem =
              state.items.find(
                (item) =>
                  item.productId ===
                  productId,
              );

            if (existingItem) {
              return {
                items: state.items.map(
                  (item) =>
                    item.productId ===
                    productId
                      ? {
                          ...item,
                          quantity: Math.min(
                            item.quantity +
                              1,
                            maximumQuantity,
                          ),
                        }
                      : item,
                ),
              };
            }

            return {
              items: [
                ...state.items,
                {
                  productId,
                  quantity: 1,
                },
              ],
            };
          });
        },

        removeItem: (productId) => {
          set((state) => {
            const nextItems =
              state.items.filter(
                (item) =>
                  item.productId !==
                  productId,
              );

            return {
              items: nextItems,

              appliedPromotionCode:
                nextItems.length === 0
                  ? null
                  : state.appliedPromotionCode,
            };
          });
        },

        increaseQuantity: (
          productId,
          maximumQuantity,
        ) => {
          set((state) => ({
            items: state.items.map(
              (item) =>
                item.productId ===
                productId
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + 1,
                        maximumQuantity,
                      ),
                    }
                  : item,
            ),
          }));
        },

        decreaseQuantity: (
          productId,
        ) => {
          set((state) => {
            const nextItems =
              state.items.flatMap(
                (item) => {
                  if (
                    item.productId !==
                    productId
                  ) {
                    return [item];
                  }

                  if (
                    item.quantity <= 1
                  ) {
                    return [];
                  }

                  return [
                    {
                      ...item,
                      quantity:
                        item.quantity - 1,
                    },
                  ];
                },
              );

            return {
              items: nextItems,

              appliedPromotionCode:
                nextItems.length === 0
                  ? null
                  : state.appliedPromotionCode,
            };
          });
        },

        setQuantity: (
          productId,
          quantity,
          maximumQuantity,
        ) => {
          const normalizedQuantity =
            Math.max(
              0,
              Math.min(
                quantity,
                maximumQuantity,
              ),
            );

          set((state) => {
            const nextItems =
              normalizedQuantity === 0
                ? state.items.filter(
                    (item) =>
                      item.productId !==
                      productId,
                  )
                : state.items.map(
                    (item) =>
                      item.productId ===
                      productId
                        ? {
                            ...item,
                            quantity:
                              normalizedQuantity,
                          }
                        : item,
                  );

            return {
              items: nextItems,

              appliedPromotionCode:
                nextItems.length === 0
                  ? null
                  : state.appliedPromotionCode,
            };
          });
        },

        applyPromotionCode: (
          promotionCode,
        ) => {
          set({
            appliedPromotionCode:
              promotionCode
                .trim()
                .toUpperCase(),
          });
        },

        removePromotionCode: () => {
          set({
            appliedPromotionCode: null,
          });
        },

        clearCart: () => {
          set({
            items: [],
            appliedPromotionCode: null,
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
      {
        name: CART_STORAGE_KEY,

        storage: createJSONStorage(
          () =>
            window.localStorage,
        ),

        partialize: (state) => ({
          items: state.items,

          appliedPromotionCode:
            state.appliedPromotionCode,
        }),

        skipHydration: true,
      },
    ),
  );