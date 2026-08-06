import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  Package,
} from "lucide-react";

import {
  getAllOrders,
} from "@/data/orders";

import {
  formatCurrency,
} from "@/lib/format-currency";

import {
  getOrderStatusClassName,
  getOrderStatusLabel,
} from "@/lib/orders";

export const metadata: Metadata = {
  title: "Orders",
  description:
    "View your HotLap order history.",
};

export default function OrdersPage() {
  const orders = getAllOrders();

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Purchase History
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Your Orders
      </h1>

      <p className="mt-4 text-muted-foreground">
        Track recent purchases and review previous
        HotLap orders.
      </p>

      {orders.length > 0 ? (
        <div className="mt-10 space-y-5">
          {orders.map((order) => {
            const totalQuantity =
              order.items.reduce(
                (total, item) =>
                  total + item.quantity,
                0,
              );

            return (
              <article
                key={order.id}
                className="rounded-2xl border bg-card p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Order number
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {order.id}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Placed on {order.placedOn}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusClassName(
                      order.status,
                    )}`}
                  >
                    {getOrderStatusLabel(
                      order.status,
                    )}
                  </span>
                </div>

                <div className="mt-6 grid gap-5 border-y py-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Products
                    </p>

                    <p className="mt-1 font-semibold">
                      {totalQuantity}{" "}
                      {totalQuantity === 1
                        ? "item"
                        : "items"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment
                    </p>

                    <p className="mt-1 font-semibold">
                      {order.paymentMethod}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total
                    </p>

                    <p className="mt-1 font-bold">
                      {formatCurrency(
                        order.total,
                        "INR",
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Package className="h-5 w-5" />

                    <span>
                      {order.items
                        .map(
                          (item) =>
                            item.productName,
                        )
                        .join(", ")}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex shrink-0 items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
                  >
                    View Order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed px-6 py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground" />

          <h2 className="mt-5 text-xl font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-muted-foreground">
            Your completed HotLap orders will appear here.
          </p>
        </div>
      )}
    </div>
  );
}