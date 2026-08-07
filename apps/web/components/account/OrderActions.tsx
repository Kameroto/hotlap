"use client";

import {
  Download,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

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

  async function reorderItems() {
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

        await addItem(
          item.productId,
          item.quantity,
        );

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
          isLoading
        }
        onClick={() => {
          void reorderItems();
        }}
      >
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
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