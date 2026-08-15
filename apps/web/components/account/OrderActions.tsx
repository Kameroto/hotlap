"use client";

import {
  Download,
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
  orderId: string;
  items: OrderItem[];
};

export default function OrderActions({
  orderId,
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

    try {
      for (
        const item of
        items
      ) {
        if (
          !item.productId
        ) {
          continue;
        }

        const itemWasAdded =
          await addItem(
            item.productId,
            item.quantity,
          );

        if (!itemWasAdded) {
          continue;
        }

        addedQuantity +=
          item.quantity;
      }

      if (
        addedQuantity === 0
      ) {
        toast.error(
          "The products in this order are currently unavailable.",
        );

        return;
      }

      toast.success(
        `${addedQuantity} ${
          addedQuantity === 1
            ? "item"
            : "items"
        } added to your cart.`,
        {
          action: {
            label:
              "View Cart",

            onClick: () => {
              window.location.href =
                "/cart";
            },
          },
        },
      );
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

  function handleInvoiceDownload() {
    toast.info(
      `Invoice generation for ${orderId} is planned after the MVP.`,
    );
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

        Reorder Items
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={
          handleInvoiceDownload
        }
      >
        <Download className="h-4 w-4" />
        Download Invoice
      </Button>
    </div>
  );
}
