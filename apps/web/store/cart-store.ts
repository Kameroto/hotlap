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

  decreaseQuantity: (productId: string) => void;

  setQuantity: (
    productId: string,
    quantity: number,
    maximumQuantity: number,
  ) => void;

  clearCart: () => void;

  setHasHydrated: (hasHydrated: boolean) => void;
};

export const CART_STORAGE_KEY = "hotlap-cart-store";

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,

      addItem: (productId, maximumQuantity) => {
        if (maximumQuantity <= 0) {
          return;
        }

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === productId,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + 1,
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
        set((state) => ({
          items: state.items.filter(
            (item) => item.productId !== productId,
          ),
        }));
      },

      increaseQuantity: (
        productId,
        maximumQuantity,
      ) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
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

      decreaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.productId !== productId) {
              return [item];
            }

            if (item.quantity <= 1) {
              return [];
            }

            return [
              {
                ...item,
                quantity: item.quantity - 1,
              },
            ];
          }),
        }));
      },

      setQuantity: (
        productId,
        quantity,
        maximumQuantity,
      ) => {
        const normalizedQuantity = Math.max(
          0,
          Math.min(quantity, maximumQuantity),
        );

        set((state) => {
          if (normalizedQuantity === 0) {
            return {
              items: state.items.filter(
                (item) =>
                  item.productId !== productId,
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: normalizedQuantity,
                  }
                : item,
            ),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
        });
      },

      setHasHydrated: (hasHydrated) => {
        set({
          hasHydrated,
        });
      },
    }),
    {
      name: CART_STORAGE_KEY,

      storage: createJSONStorage(
        () => window.localStorage,
      ),

      partialize: (state) => ({
        items: state.items,
      }),

      skipHydration: true,
    },
  ),
);