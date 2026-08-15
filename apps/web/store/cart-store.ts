import { create } from "zustand";

import {
  ApiClientError,
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

export type CartLoadStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "error";

type CartState = {
  cart: ServerCart | null;

  hasHydrated: boolean;
  isLoading: boolean;
  isReconciling: boolean;
  loadStatus: CartLoadStatus;
  loadError: string | null;
  pendingProductIds: string[];

  initialize: () => Promise<void>;

  addItem: (
    productId: string,
    quantity?: number,
  ) => Promise<boolean>;

  removeItem: (
    productId: string,
  ) => Promise<boolean>;

  increaseQuantity: (
    productId: string,
    currentQuantity: number,
  ) => Promise<boolean>;

  decreaseQuantity: (
    productId: string,
    currentQuantity: number,
  ) => Promise<boolean>;

  setQuantity: (
    productId: string,
    quantity: number,
  ) => Promise<boolean>;

  applyPromotionCode: (
    promotionCode: string,
  ) => Promise<boolean>;

  removePromotionCode: () => Promise<boolean>;

  refreshCart: () => Promise<void>;

  clearCart: () => Promise<boolean>;

  clearLocalCart: () => void;

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

function getCartErrorMessage(
  error: unknown,
): string {
  return error instanceof
    ApiClientError
    ? error.message
    : "Unable to load your cart.";
}

export const useCartStore =
  create<CartState>()(
    (set, get) => {
      function globalOperationCanStart(): boolean {
        const state = get();

        return (
          !state.isLoading &&
          !state.isReconciling &&
          state.pendingProductIds.length ===
            0
        );
      }

      async function loadCart(): Promise<void> {
        if (!globalOperationCanStart()) {
          return;
        }

        set({
          isLoading: true,
          loadStatus: "loading",
          loadError: null,
        });

        try {
          const cart =
            await getCart();

          set({
            cart,
            hasHydrated: true,
            loadStatus: "loaded",
            loadError: null,
          });
        } catch (error) {
          set({
            loadStatus: "error",
            loadError:
              getCartErrorMessage(
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

      async function reconcileOverlappingMutations(): Promise<void> {
        set({
          isReconciling: true,
        });

        try {
          const cart =
            await getCart();

          set({
            cart,
            hasHydrated: true,
            loadStatus: "loaded",
            loadError: null,
          });
        } catch (error) {
          set({
            loadStatus: "error",
            loadError:
              getCartErrorMessage(
                error,
              ),
          });
        } finally {
          set({
            isReconciling: false,
          });
        }
      }

      async function runProductMutation(
        productId: string,
        mutation: () => Promise<ServerCart>,
      ): Promise<boolean> {
        const currentState =
          get();

        if (
          currentState.isLoading ||
          currentState.isReconciling ||
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
          const cart =
            await mutation();

          set({
            cart,
            hasHydrated: true,
            loadStatus: "loaded",
            loadError: null,
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

            await reconcileOverlappingMutations();
          }
        }
      }

      async function runGlobalCartMutation(
        mutation: () => Promise<ServerCart>,
      ): Promise<boolean> {
        if (!globalOperationCanStart()) {
          return false;
        }

        set({
          isLoading: true,
          loadError: null,
        });

        try {
          const cart =
            await mutation();

          set({
            cart,
            hasHydrated: true,
            loadStatus: "loaded",
            loadError: null,
          });

          return true;
        } finally {
          set({
            isLoading: false,
          });
        }
      }

      return {
        cart: null,

        hasHydrated: false,
        isLoading: false,
        isReconciling: false,
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
            loadCart().finally(
              () => {
                initializationPromise =
                  null;
              },
            );

          return initializationPromise;
        },

        refreshCart: async () => {
          await loadCart();
        },

        addItem: async (
          productId,
          quantity = 1,
        ) =>
          runProductMutation(
            productId,
            () =>
              addCartItem({
                productId,
                quantity,
              }),
          ),

        removeItem: async (
          productId,
        ) =>
          runProductMutation(
            productId,
            () =>
              removeCartItem(
                productId,
              ),
          ),

        increaseQuantity: async (
          productId,
          currentQuantity,
        ) =>
          runProductMutation(
            productId,
            () =>
              updateCartItem(
                productId,
                {
                  quantity:
                    currentQuantity +
                    1,
                },
              ),
          ),

        decreaseQuantity: async (
          productId,
          currentQuantity,
        ) =>
          currentQuantity <= 1
            ? get().removeItem(
                productId,
              )
            : runProductMutation(
                productId,
                () =>
                  updateCartItem(
                    productId,
                    {
                      quantity:
                        currentQuantity -
                        1,
                    },
                  ),
              ),

        setQuantity: async (
          productId,
          quantity,
        ) =>
          quantity <= 0
            ? get().removeItem(
                productId,
              )
            : runProductMutation(
                productId,
                () =>
                  updateCartItem(
                    productId,
                    {
                      quantity,
                    },
                  ),
              ),

        applyPromotionCode:
          async (
            promotionCode,
          ) =>
            runGlobalCartMutation(
              () =>
                applyCartCoupon({
                  code:
                    promotionCode
                      .trim()
                      .toUpperCase(),
                }),
            ),

        removePromotionCode:
          async () =>
            runGlobalCartMutation(
              removeCartCoupon,
            ),

        clearCart: async () => {
          if (!globalOperationCanStart()) {
            return false;
          }

          const productIds =
            get().cart?.items.map(
              (item) =>
                item.product.id,
            ) ?? [];

          set({
            isLoading: true,
            loadError: null,
          });

          try {
            for (
              const productId of
              productIds
            ) {
              const cart =
                await removeCartItem(
                  productId,
                );

              set({
                cart,
                hasHydrated: true,
                loadStatus: "loaded",
                loadError: null,
              });
            }

            return true;
          } catch (error) {
            try {
              const cart =
                await getCart();

              set({
                cart,
                hasHydrated: true,
                loadStatus: "loaded",
                loadError:
                  getCartErrorMessage(
                    error,
                  ),
              });
            } catch {
              set({
                loadStatus:
                  "error",
                loadError:
                  getCartErrorMessage(
                    error,
                  ),
              });
            }

            throw error;
          } finally {
            set({
              isLoading: false,
            });
          }
        },

        clearLocalCart: () => {
          activeProductMutations =
            0;
          overlappingMutationsOccurred =
            false;

          set({
            cart: null,
            hasHydrated: true,
            isLoading: false,
            isReconciling: false,
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
