import Link from "next/link";

import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { products } from "@/data/products";
import { formatCurrency } from "@/lib/format-currency";

const recentOrders = [
  {
    id: "HL-7A91C3F2",
    placedOn: "2 August 2026",
    status: "Processing",
    itemCount: 2,
    total: 16498,
  },
  {
    id: "HL-4B82D1A6",
    placedOn: "18 July 2026",
    status: "Delivered",
    itemCount: 1,
    total: 9999,
  },
];

const summaryCards = [
  {
    title: "Orders",
    value: "2",
    description: "Orders placed",
    icon: Package,
  },
  {
    title: "Wishlist",
    value: "3",
    description: "Saved products",
    icon: Heart,
  },
  {
    title: "Addresses",
    value: "1",
    description: "Saved address",
    icon: MapPin,
  },
];

export default function AccountOverviewPage() {
  const recommendedProducts = products.slice(0, 2);

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Account Overview
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Welcome back, Tanmay
      </h1>

      <p className="mt-4 text-muted-foreground">
        Manage your orders, profile, delivery addresses, and account
        preferences.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border bg-card p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <Icon className="h-5 w-5" />
              </div>

              <p className="mt-5 text-3xl font-bold">
                {card.value}
              </p>

              <h2 className="mt-1 font-semibold">
                {card.title}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {card.description}
              </p>
            </article>
          );
        })}
      </div>

      <section className="mt-10 rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your latest HotLap purchases.
            </p>
          </div>

          <Link
            href="/account/orders"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            View All Orders
          </Link>
        </div>

        <div className="mt-6 divide-y">
          {recentOrders.map((order) => (
            <article
              key={order.id}
              className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {order.id}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {order.placedOn} · {order.itemCount}{" "}
                  {order.itemCount === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-8 sm:justify-end">
                <span
                  className={
                    order.status === "Delivered"
                      ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                      : "rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800"
                  }
                >
                  {order.status}
                </span>

                <p className="font-bold">
                  {formatCurrency(order.total, "INR")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Recommended for You
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Products selected from the current HotLap catalogue.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-2 text-sm font-semibold text-red-600 hover:underline sm:flex"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {recommendedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex items-center justify-between gap-5 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {product.brand}
                </p>

                <h3 className="mt-2 font-semibold transition group-hover:text-red-600">
                  {product.name}
                </h3>

                <p className="mt-2 font-bold">
                  {formatCurrency(
                    product.price,
                    product.currency,
                  )}
                </p>
              </div>

              <ShoppingBag className="h-6 w-6 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}