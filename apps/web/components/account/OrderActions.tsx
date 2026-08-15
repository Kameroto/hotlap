"use client";

import {
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  Button,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import {
  useCartStore,
} from "@/store/cart-store";

import type {
  OrderItem,
} from "@/types/order";

type OrderActionsProps = {
  items: OrderItem[];
};

export default function OrderActions({
  items,
}: OrderActionsProps) {
  const reorderIsInFlight =
    useRef(false);

  const [
    reorderIsPending,
    setReorderIsPending,
  ] = useState(false);

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  const hasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
    );

  const isLoading =
    useCartStore(
      (state) =>
        state.isLoading,
    );

  const isReconciling =
    useCartStore(
      (state) =>
        state.isReconciling,
    );

  const itemMutationIsPending =
    useCartStore(
      (state) =>
        state.pendingProductIds.length >
        0,
    );

  const loadStatus =
    useCartStore(
      (state) =>
        state.loadStatus,
    );

  async function reorderItems() {
    if (reorderIsInFlight.current) {
      return;
    }

    reorderIsInFlight.current =
      true;
    setReorderIsPending(true);

    let addedQuantity = 0;
    let addedProductCount = 0;
    const failedProductNames: string[] =
      [];
    const skippedProductNames: string[] =
      [];

    try {
      for (
        const item of
        items
      ) {
        if (
          !item.productId
        ) {
          skippedProductNames.push(
            item.productName,
          );
          continue;
        }

        try {
          const itemWasAdded =
            await addItem(
              item.productId,
              item.quantity,
            );

          if (!itemWasAdded) {
            failedProductNames.push(
              item.productName,
            );
            continue;
          }

          addedQuantity +=
            item.quantity;
          addedProductCount += 1;
        } catch {
          failedProductNames.push(
            item.productName,
          );
        }
      }

      const unavailableCount =
        failedProductNames.length +
        skippedProductNames.length;

      if (
        addedQuantity === 0
      ) {
        toast.error(
          unavailableCount > 0
            ? "None of the products in this order could be added. They may be unavailable or exceed current stock."
            : "This order has no products available to reorder.",
        );

        return;
      }

      const reorderMessage =
        unavailableCount > 0
          ? `${addedQuantity} ${
              addedQuantity === 1
                ? "item was"
                : "items were"
            } added from ${addedProductCount} ${
              addedProductCount === 1
                ? "product"
                : "products"
            }. ${unavailableCount} ${
              unavailableCount === 1
                ? "product could"
                : "products could"
            } not be added.`
          : `${addedQuantity} ${
              addedQuantity === 1
                ? "item"
                : "items"
            } added to your cart.`;

      const toastOptions = {
        action: {
          label: "View Cart",

          onClick: () => {
            window.location.href =
              "/cart";
          },
        },
      };

      if (unavailableCount > 0) {
        toast.warning(
          reorderMessage,
          toastOptions,
        );
      } else {
        toast.success(
          reorderMessage,
          toastOptions,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to reorder these products.",
      );
    } finally {
      reorderIsInFlight.current =
        false;
      setReorderIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        disabled={
          !hasHydrated ||
          loadStatus !== "loaded" ||
          isLoading ||
          isReconciling ||
          itemMutationIsPending ||
          reorderIsPending
        }
        onClick={() => {
          void reorderItems();
        }}
      >
        {reorderIsPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}

        Reorder items
      </Button>
    </div>
  );
}
