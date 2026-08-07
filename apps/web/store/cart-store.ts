import { create } from "zustand";

import {
  addCartItem,
  applyCartCoupon,
  getCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/client";

import type {
  ServerCart,
} from "@/lib/api/types";

type CartState = {
  cart: ServerCart | null;

  hasHydrated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;

  addItem: (
    productId: string,
    quantity?: number,
  ) => Promise<void>;

  removeItem: (
    productId: string,
  ) => Promise<void>;

  increaseQuantity: (
    productId: string,
    currentQuantity: number,
  ) => Promise<void>;

  decreaseQuantity: (
    productId: string,
    currentQuantity: number,
  ) => Promise<void>;

  setQuantity: (
    productId: string,
    quantity: number,
  ) => Promise<void>;

  applyPromotionCode: (
    promotionCode: string,
  ) => Promise<void>;

  removePromotionCode: () => Promise<void>;

  refreshCart: () => Promise<void>;

  clearLocalCart: () => void;

  setHasHydrated: (
    hasHydrated: boolean,
  ) => void;
};

let initializationPromise:
  | Promise<void>
  | null = null;

export const useCartStore =
  create<CartState>()(
    (set, get) => ({
      cart: null,

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
              const cart =
                await getCart();

              set({
                cart,
                hasHydrated: true,
              });
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

      refreshCart: async () => {
        set({
          isLoading: true,
        });

        try {
          const cart =
            await getCart();

          set({
            cart,
            hasHydrated: true,
          });
        } finally {
          set({
            isLoading: false,
          });
        }
      },

      addItem: async (
        productId,
        quantity = 1,
      ) => {
        set({
          isLoading: true,
        });

        try {
          const cart =
            await addCartItem({
              productId,
              quantity,
            });

          set({
            cart,
            hasHydrated: true,
          });
        } finally {
          set({
            isLoading: false,
          });
        }
      },

      removeItem: async (
        productId,
      ) => {
        set({
          isLoading: true,
        });

        try {
          const cart =
            await removeCartItem(
              productId,
            );

          set({
            cart,
            hasHydrated: true,
          });
        } finally {
          set({
            isLoading: false,
          });
        }
      },

      increaseQuantity: async (
        productId,
        currentQuantity,
      ) => {
        set({
          isLoading: true,
        });

        try {
          const cart =
            await updateCartItem(
              productId,
              {
                quantity:
                  currentQuantity +
                  1,
              },
            );

          set({
            cart,
            hasHydrated: true,
          });
        } finally {
          set({
            isLoading: false,
          });
        }
      },

      decreaseQuantity: async (
        productId,
        currentQuantity,
      ) => {
        if (
          currentQuantity <= 1
        ) {
          await get().removeItem(
            productId,
          );

          return;
        }

        set({
          isLoading: true,
        });

        try {
          const cart =
            await updateCartItem(
              productId,
              {
                quantity:
                  currentQuantity -
                  1,
              },
            );

          set({
            cart,
            hasHydrated: true,
          });
        } finally {
          set({
            isLoading: false,
          });
        }
      },

      setQuantity: async (
        productId,
        quantity,
      ) => {
        if (
          quantity <= 0
        ) {
          await get().removeItem(
            productId,
          );

          return;
        }

        set({
          isLoading: true,
        });

        try {
          const cart =
            await updateCartItem(
              productId,
              {
                quantity,
              },
            );

          set({
            cart,
            hasHydrated: true,
          });
        } finally {
          set({
            isLoading: false,
          });
        }
      },

      applyPromotionCode:
        async (
          promotionCode,
        ) => {
          set({
            isLoading: true,
          });

          try {
            const cart =
              await applyCartCoupon({
                code:
                  promotionCode
                    .trim()
                    .toUpperCase(),
              });

            set({
              cart,
              hasHydrated: true,
            });
          } finally {
            set({
              isLoading: false,
            });
          }
        },

      removePromotionCode:
        async () => {
          set({
            isLoading: true,
          });

          try {
            const cart =
              await removeCartCoupon();

            set({
              cart,
              hasHydrated: true,
            });
          } finally {
            set({
              isLoading: false,
            });
          }
        },

      clearLocalCart: () => {
        set({
          cart: null,
          hasHydrated: true,
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