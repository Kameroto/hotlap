"use client";

import {
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { useCartStore } from "@/store/cart-store";
import type { OrderItem } from "@/types/order";

type OrderActionsProps = {
  orderId: string;
  items: OrderItem[];
};

export default function OrderActions({
  orderId,
  items,
}: OrderActionsProps) {
  const addItem = useCartStore(
    (state) => state.addItem,
  );

  const hasHydrated = useCartStore(
    (state) => state.hasHydrated,
  );

  function reorderItems() {
    let addedQuantity = 0;

    items.forEach((orderItem) => {
      const product = products.find(
        (candidateProduct) =>
          candidateProduct.id ===
          orderItem.productId,
      );

      if (!product) {
        return;
      }

      const quantityToAdd = Math.min(
        orderItem.quantity,
        product.stockQuantity,
      );

      for (
        let quantityIndex = 0;
        quantityIndex < quantityToAdd;
        quantityIndex += 1
      ) {
        addItem(
          product.id,
          product.stockQuantity,
        );

        addedQuantity += 1;
      }
    });

    if (addedQuantity === 0) {
      toast.error(
        "The products in this order are currently unavailable.",
      );

      return;
    }

    toast.success(
      `${addedQuantity} ${
        addedQuantity === 1 ? "item" : "items"
      } added to your cart.`,
      {
        action: {
          label: "View Cart",
          onClick: () => {
            window.location.href = "/cart";
          },
        },
      },
    );
  }

  function handleInvoiceDownload() {
    toast.info(
      `Invoice generation for ${orderId} will be connected to the backend.`,
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        onClick={reorderItems}
        disabled={!hasHydrated}
      >
        <RefreshCw className="h-4 w-4" />
        Reorder Items
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleInvoiceDownload}
      >
        <Download className="h-4 w-4" />
        Download Invoice
      </Button>
    </div>
  );
}